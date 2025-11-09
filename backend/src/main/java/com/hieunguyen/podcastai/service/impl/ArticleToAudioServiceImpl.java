package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.GoogleTtsRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.TtsConfig;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.enums.ProcessingStatus;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.AudioRepository;
import com.hieunguyen.podcastai.service.ArticleToAudioService;
import com.hieunguyen.podcastai.service.AudioStorageService;
import com.hieunguyen.podcastai.service.GoogleTtsService;
import com.hieunguyen.podcastai.util.ArticleToSsmlConverter;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ArticleToAudioServiceImpl implements ArticleToAudioService {
    
    private final GoogleTtsService googleTtsService;
    private final AudioStorageService audioStorageService;
    private final AudioRepository audioRepository;
    private final ArticleToSsmlConverter ssmlConverter;
    private final SecurityUtils securityUtils;
    
    private static final int MAX_SSML_LENGTH = 5000;
    
    @Override
    public AudioFile convertArticleToAudio(NewsArticle article, TtsConfig ttsConfig) {
        log.info("Converting article {} to audio", article.getId());
        
        // Get voice settings from TTS config or use default
        VoiceSettingsRequest voiceSettings = getVoiceSettings(ttsConfig);
        
        // Create AudioFile entity
        AudioFile audioFile = createPendingAudioFile(article, ttsConfig);
        
        try {
            // Update status to GENERATING_AUDIO
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.GENERATING_AUDIO, null);
            
            // Perform audio conversion
            performAudioConversion(audioFile, article, voiceSettings);
            
            // Update status to COMPLETED
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.COMPLETED, null);
            
            log.info("Successfully converted article {} to audio file: {}", 
                    article.getId(), audioFile.getFileName());
            
            return audioFile;
            
        } catch (Exception e) {
            log.error("Failed to convert article {} to audio: {}", 
                    article.getId(), e.getMessage(), e);
            
            // Update status to FAILED with error message
            String errorMessage = e.getMessage();
            String errorCode = extractErrorCode(e);
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.FAILED, errorMessage);
            
            // Update error code
            audioFile = audioRepository.findById(audioFile.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.AUDIO_FILE_NOT_FOUND));
            audioFile.setErrorCode(errorCode);
            audioRepository.save(audioFile);
            
            throw new RuntimeException("Failed to convert article to audio", e);
        }
    }
    
    @Override
    @Async("ttsTaskExecutor")
    public void convertArticleToAudioAsync(NewsArticle article, TtsConfig ttsConfig) {
        log.info("Starting async audio conversion for article: {}", article.getId());
        
        // Get the audio file that was created with PENDING status
        AudioFile audioFile = audioRepository.findFirstByNewsArticleOrderByCreatedAtDesc(article)
                .orElseThrow(() -> new AppException(ErrorCode.AUDIO_FILE_NOT_FOUND));
        
        try {
            // Update status to GENERATING_AUDIO
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.GENERATING_AUDIO, null);
            
            // Get voice settings
            VoiceSettingsRequest voiceSettings = getVoiceSettings(ttsConfig);
            
            // Perform audio conversion
            performAudioConversion(audioFile, article, voiceSettings);
            
            // Update status to COMPLETED
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.COMPLETED, null);
            
            log.info("Successfully completed async audio conversion for article: {}", article.getId());
            
        } catch (Exception e) {
            log.error("Failed async audio conversion for article {}: {}", 
                    article.getId(), e.getMessage(), e);
            
            // Update status to FAILED with error message
            String errorMessage = e.getMessage();
            String errorCode = extractErrorCode(e);
            updateAudioFileStatus(audioFile.getId(), ProcessingStatus.FAILED, errorMessage);
            
            // Update error code and retry count
            audioFile = audioRepository.findById(audioFile.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.AUDIO_FILE_NOT_FOUND));
            audioFile.setErrorCode(errorCode);
            audioFile.setRetryCount(audioFile.getRetryCount() + 1);
            audioRepository.save(audioFile);
        }
    }
    
    @Override
    public AudioFile createPendingAudioFile(NewsArticle article, TtsConfig ttsConfig) {
        User currentUser = securityUtils.getCurrentUser();
        
        AudioFile audioFile = AudioFile.builder()
                .title(article.getTitle())
                .description(article.getDescription())
                .sourceUrl(null) // Can be set if article has URL
                .user(currentUser)
                .newsArticle(article)
                .ttsConfig(ttsConfig)
                .status(ProcessingStatus.PENDING)
                .errorMessage(null)
                .errorCode(null)
                .retryCount(0)
                .build();
        
        return audioRepository.save(audioFile);
    }
    
    @Override
    @Transactional
    public void updateAudioFileStatus(Long audioFileId, ProcessingStatus status, String errorMessage) {
        AudioFile audioFile = audioRepository.findById(audioFileId)
                .orElseThrow(() -> new AppException(ErrorCode.AUDIO_FILE_NOT_FOUND));
        
        audioFile.setStatus(status);
        audioFile.setErrorMessage(errorMessage);
        
        if (status == ProcessingStatus.FAILED && errorMessage != null) {
            // Extract error code if possible
            audioFile.setErrorCode(extractErrorCodeFromMessage(errorMessage));
        } else if (status == ProcessingStatus.COMPLETED) {
            // Clear error fields on success
            audioFile.setErrorMessage(null);
            audioFile.setErrorCode(null);
        }
        
        audioRepository.save(audioFile);
        log.debug("Updated audio file {} status to {}", audioFileId, status);
    }
    
    /**
     * Perform the actual audio conversion
     */
    private void performAudioConversion(AudioFile audioFile, NewsArticle article, VoiceSettingsRequest voiceSettings) {
        // Convert article content to SSML
        String ssml = ssmlConverter.convertToSsml(article.getContent(), article.getTitle());
        
        byte[] audioBytes;
        
        if (ssml.length() > MAX_SSML_LENGTH) {
            log.info("Article content exceeds SSML limit ({} chars), using plainText chunking", ssml.length());
            audioBytes = googleTtsService.synthesizeLongTextInChunks(
                article.getPlainText(), voiceSettings);
        } else {
            log.info("Using SSML synthesis for article ({} chars)", ssml.length());
            GoogleTtsRequest request = GoogleTtsRequest.builder()
                    .text(ssml)
                    .voiceSettings(voiceSettings)
                    .build();
            
            audioBytes = googleTtsService.synthesizeSsml(request);
        }
        
        // Generate filename
        String fileName = generateAudioFileName(voiceSettings.getAudioEncoding());
        audioFile.setFileName(fileName);
        
        // Store audio file
        String filePath = audioStorageService.storeAudioFile(audioFile, audioBytes);
        audioFile.setFilePath(filePath);
        audioFile.setFileSizeBytes((long) audioBytes.length);
        audioFile.setPublishedAt(Instant.now());
        
        audioRepository.save(audioFile);
    }
    
    /**
     * Get voice settings from TTS config or use defaults
     */
    private VoiceSettingsRequest getVoiceSettings(TtsConfig ttsConfig) {
        if (ttsConfig != null) {
            return VoiceSettingsRequest.builder()
                    .languageCode(ttsConfig.getLanguageCode())
                    .voiceName(ttsConfig.getVoiceName())
                    .speakingRate(ttsConfig.getSpeakingRate())
                    .pitch(ttsConfig.getPitch())
                    .volumeGain(ttsConfig.getVolumeGainDb())
                    .audioEncoding(ttsConfig.getAudioEncoding())
                    .sampleRateHertz(ttsConfig.getSampleRateHertz())
                    .build();
        }
        
        // Default settings
        return VoiceSettingsRequest.builder()
                .languageCode("vi-VN")
                .voiceName("vi-VN-Standard-A")
                .speakingRate(1.0)
                .pitch(0.0)
                .volumeGain(0.0)
                .audioEncoding("MP3")
                .sampleRateHertz(24000)
                .build();
    }
    
    /**
     * Generate audio file name
     */
    private String generateAudioFileName(String audioEncoding) {
        String extension = audioEncoding.toLowerCase();
        if (extension.equals("mp3")) {
            extension = "mp3";
        } else if (extension.equals("wav")) {
            extension = "wav";
        } else if (extension.equals("ogg")) {
            extension = "ogg";
        } else if (extension.equals("flac")) {
            extension = "flac";
        } else {
            extension = "mp3";
        }
        
        return String.format("article_audio_%s.%s", UUID.randomUUID().toString(), extension);
    }
    
    /**
     * Extract error code from exception
     */
    private String extractErrorCode(Exception e) {
        String message = e.getMessage();
        if (message == null) {
            return "UNKNOWN_ERROR";
        }
        
        String lowerMessage = message.toLowerCase();
        if (lowerMessage.contains("quota") || lowerMessage.contains("limit")) {
            return "QUOTA_EXCEEDED";
        } else if (lowerMessage.contains("timeout")) {
            return "TIMEOUT";
        } else if (lowerMessage.contains("invalid")) {
            return "INVALID_INPUT";
        } else if (lowerMessage.contains("network") || lowerMessage.contains("connection")) {
            return "NETWORK_ERROR";
        } else if (lowerMessage.contains("permission") || lowerMessage.contains("access")) {
            return "PERMISSION_DENIED";
        } else {
            return "UNKNOWN_ERROR";
        }
    }
    
    /**
     * Extract error code from error message
     */
    private String extractErrorCodeFromMessage(String errorMessage) {
        if (errorMessage == null) {
            return "UNKNOWN_ERROR";
        }
        
        String lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.contains("quota") || lowerMessage.contains("limit")) {
            return "QUOTA_EXCEEDED";
        } else if (lowerMessage.contains("timeout")) {
            return "TIMEOUT";
        } else if (lowerMessage.contains("invalid")) {
            return "INVALID_INPUT";
        } else if (lowerMessage.contains("network") || lowerMessage.contains("connection")) {
            return "NETWORK_ERROR";
        } else if (lowerMessage.contains("permission") || lowerMessage.contains("access")) {
            return "PERMISSION_DENIED";
        } else {
            return "UNKNOWN_ERROR";
        }
    }
}

