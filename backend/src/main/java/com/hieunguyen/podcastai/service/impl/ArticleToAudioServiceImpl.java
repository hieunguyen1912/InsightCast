package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.request.LongAudioSynthesisRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.dto.response.AudioGenerationStatusDto;
import com.hieunguyen.podcastai.dto.response.LongAudioSynthesisResponse;
import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.TtsConfig;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.enums.ProcessingStatus;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.AudioMapper;
import com.hieunguyen.podcastai.mapper.TtsConfigMapper;
import com.hieunguyen.podcastai.repository.AudioRepository;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.repository.TtsConfigRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.hieunguyen.podcastai.service.ArticleToAudioService;
import com.hieunguyen.podcastai.service.GoogleTtsService;
import com.hieunguyen.podcastai.util.ArticleToSsmlConverter;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.channels.Channels;
import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ArticleToAudioServiceImpl implements ArticleToAudioService {
    
    private final AudioRepository audioRepository;
    private final NewsArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final TtsConfigRepository ttsConfigRepository;
    private final SecurityUtils securityUtils;
    private final TtsConfigMapper ttsConfigMapper;
    private final GoogleTtsService googleTtsService;
    private final ArticleToSsmlConverter articleToSsmlConverter;
    private final Storage storage;
    private final AudioMapper audioMapper;
    private final NewsArticleRepository newsArticleRepository;

    @Override
    public AudioFileDto generateAudioFromArticle(Long articleId, AudioRequest request) {
        log.info("Generating audio for article: {} with config: {}", articleId, 
                request.getCustomVoiceSettings() != null ? "custom" : "default");

        // 1. Get current user
        User currentUser = securityUtils.getCurrentUser();
        log.info("current user: {}", currentUser.getDefaultTtsConfig());

        // 2. Find and validate article
        NewsArticle article = articleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        // Validate ownership
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        VoiceSettingsRequest voiceSettings = resolveVoiceSettings(request, currentUser);
        
        // 4. Convert article to SSML
        String ssmlContent = articleToSsmlConverter.convertToSsml(article.getContent(), article.getTitle());
        
        // 5. Generate file name (use same name for both GCS and database)
        String fileName = generateAudioFileName(article, voiceSettings, false);
        
        // 6. Generate audio using Google TTS Long Audio Synthesis
        LongAudioSynthesisRequest longAudioSynthesisRequest = LongAudioSynthesisRequest.builder()
                .text(ssmlContent)
                .voiceSettings(voiceSettings)
                .outputFileName(fileName)
                .build();
        
        LongAudioSynthesisResponse synthesisResponse = googleTtsService.synthesizeLongAudio(longAudioSynthesisRequest);
        
        // 7. Create AudioFile entity with operation info
        AudioFile audioFile = AudioFile.builder()
                .newsArticle(article)
                .user(currentUser)
                .fileName(fileName)
                .status(ProcessingStatus.GENERATING_AUDIO)
                .operationName(synthesisResponse.getOperationName())
                .gcsUri(synthesisResponse.getOutputGcsUri())
                .ttsConfig(getTtsConfigFromRequest(request, currentUser))
                .build();
        
        // Save to database
        AudioFile savedAudioFile = audioRepository.save(audioFile);
        
        log.info("Long audio synthesis started for article: {}, operation: {}, audio file ID: {}", 
                articleId, synthesisResponse.getOperationName(), savedAudioFile.getId());
        
        
        return audioMapper.toDto(savedAudioFile);
    }

    @Override
    public AudioFileDto generateAudioFromSummary(Long articleId, AudioRequest request) {
        log.info("Generating audio from summary for article: {} with config: {}", articleId, 
                request.getCustomVoiceSettings() != null ? "custom" : "default");

        User currentUser = securityUtils.getCurrentUser();
        log.info("Current user: {}", currentUser.getEmail());

        NewsArticle article = articleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        if (article.getSummary() == null || article.getSummary().trim().isEmpty()) {
            throw new AppException(ErrorCode.SUMMARY_NOT_AVAILABLE);
        }

        VoiceSettingsRequest voiceSettings = resolveVoiceSettings(request, currentUser);
        
        String ssmlContent = articleToSsmlConverter.convertPlainTextToSsml(article.getSummary(), article.getTitle());
        
        String fileName = generateAudioFileName(article, voiceSettings, true);
        
        LongAudioSynthesisRequest longAudioSynthesisRequest = LongAudioSynthesisRequest.builder()
                .text(ssmlContent)
                .voiceSettings(voiceSettings)
                .outputFileName(fileName)
                .build();
        
        LongAudioSynthesisResponse synthesisResponse = googleTtsService.synthesizeLongAudio(longAudioSynthesisRequest);
        
        AudioFile audioFile = AudioFile.builder()
                .newsArticle(article)
                .user(currentUser)
                .fileName(fileName)
                .status(ProcessingStatus.GENERATING_AUDIO)
                .operationName(synthesisResponse.getOperationName())
                .gcsUri(synthesisResponse.getOutputGcsUri())
                .ttsConfig(getTtsConfigFromRequest(request, currentUser))
                .build();
        
        AudioFile savedAudioFile = audioRepository.save(audioFile);
        
        log.info("Long audio synthesis from summary started for article: {}, operation: {}, audio file ID: {}", 
                articleId, synthesisResponse.getOperationName(), savedAudioFile.getId());
        
        return audioMapper.toDto(savedAudioFile);
    }

    private VoiceSettingsRequest resolveVoiceSettings(AudioRequest request, User user) {
        // Priority 1: Custom voice settings
        if (request.getCustomVoiceSettings() != null) {
            log.debug("Using custom voice settings from request");
            return request.getCustomVoiceSettings();
        }
        
        // Priority 2: Default TTS Config from user
        log.debug("Using default TTS config from user");
        
        TtsConfig defaultTtsConfig = ttsConfigRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.TTS_CONFIG_NOT_FOUND));
        
        if (defaultTtsConfig != null) {
            log.debug("Found default TTS config: {}", defaultTtsConfig.getId());
            return ttsConfigMapper.toVoiceSettingsRequest(defaultTtsConfig);
        }
        
        // No default config found
        log.warn("No default TTS config found for user: {}", user.getId());
        throw new AppException(ErrorCode.TTS_CONFIG_NO_DEFAULT);
    }

    
    private TtsConfig getTtsConfigFromRequest(AudioRequest request, User user) {
        // If using custom settings, return null (no config entity)
        if (request.getCustomVoiceSettings() != null) {
            return null;
        }
        
        // Otherwise, return user's default config
        User userWithConfig = userRepository.findByIdWithDefaultTtsConfig(user.getId())
                .orElse(user);
        return userWithConfig.getDefaultTtsConfig();
    }

    @Override
    public AudioGenerationStatusDto checkAndUpdateAudioGenerationStatus(Long audioFileId) {
        log.info("Checking audio generation status for audio file ID: {}", audioFileId);
        
        // 1. Get current user and validate
        User currentUser = securityUtils.getCurrentUser();
        
        // 2. Find audio file
        AudioFile audioFile = audioRepository.findById(audioFileId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Validate ownership
        if (!audioFile.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        // 3. Check if already completed or failed
        if (audioFile.getStatus() == ProcessingStatus.COMPLETED) {
            log.info("Audio file {} is already completed", audioFileId);
            return AudioGenerationStatusDto.builder()
                    .audioFileId(audioFileId)
                    .status(ProcessingStatus.COMPLETED)
                    .build();
        }
        
        if (audioFile.getStatus() == ProcessingStatus.FAILED) {
            log.info("Audio file {} has failed", audioFileId);
            return AudioGenerationStatusDto.builder()
                    .audioFileId(audioFileId)
                    .status(ProcessingStatus.FAILED)
                    .errorMessage(audioFile.getErrorMessage())
                    .build();
        }
        
        // 4. Check if operation name exists
        if (audioFile.getOperationName() == null || audioFile.getOperationName().isEmpty()) {
            log.error("Audio file {} does not have operation name", audioFileId);
            audioFile.setStatus(ProcessingStatus.FAILED);
            audioFile.setErrorMessage("Operation name not found");
            audioRepository.save(audioFile);
            return AudioGenerationStatusDto.builder()
                    .audioFileId(audioFileId)
                    .status(ProcessingStatus.FAILED)
                    .errorMessage("Operation name not found")
                    .build();
        }
        
        // 5. Check operation status from Google Cloud
        try {
            LongAudioSynthesisResponse statusResponse = googleTtsService.checkLongAudioOperationStatus(
                    audioFile.getOperationName());
            
            log.info("Operation status for {}: done={}, progress={}%", 
                    audioFile.getOperationName(), statusResponse.getDone(), statusResponse.getProgressPercentage());
            
            // 6. If operation is done
            if (Boolean.TRUE.equals(statusResponse.getDone())) {
                // Check for errors
                if (statusResponse.getErrorMessage() != null) {
                    log.error("Audio synthesis failed for {}: {}", audioFileId, statusResponse.getErrorMessage());
                    audioFile.setStatus(ProcessingStatus.FAILED);
                    audioFile.setErrorMessage(statusResponse.getErrorMessage());
                    audioRepository.save(audioFile);
                    return AudioGenerationStatusDto.builder()
                            .audioFileId(audioFileId)
                            .status(ProcessingStatus.FAILED)
                            .errorMessage(statusResponse.getErrorMessage())
                            .build();
                }
                
                // Update status to completed (file is available in GCS, no need to download)
                audioFile.setStatus(ProcessingStatus.COMPLETED);
                if (statusResponse.getOutputGcsUri() != null) {
                    audioFile.setGcsUri(statusResponse.getOutputGcsUri());
                }
                audioRepository.save(audioFile);
                
                log.info("Audio synthesis completed for {}, file available at GCS: {}", 
                        audioFileId, audioFile.getGcsUri());
                
                return AudioGenerationStatusDto.builder()
                        .audioFileId(audioFileId)
                        .status(ProcessingStatus.COMPLETED)
                        .progressPercentage(100.0)
                        .build();
            } else {
                // Operation still in progress
                log.debug("Audio synthesis still in progress for {}: {}%", 
                        audioFileId, statusResponse.getProgressPercentage());
                
                return AudioGenerationStatusDto.builder()
                        .audioFileId(audioFileId)
                        .status(ProcessingStatus.GENERATING_AUDIO)
                        .progressPercentage(statusResponse.getProgressPercentage())
                        .build();
            }
            
        } catch (Exception e) {
            log.error("Failed to check operation status for {}: {}", audioFileId, e.getMessage(), e);
            audioFile.setStatus(ProcessingStatus.FAILED);
            audioFile.setErrorMessage("Failed to check operation status: " + e.getMessage());
            audioRepository.save(audioFile);
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
    }
    

    public InputStream getAudioStreamFromGcs(String gcsUri) {
        if (gcsUri == null || !gcsUri.startsWith("gs://")) {
            throw new IllegalArgumentException("Invalid GCS URI: " + gcsUri);
        }
        
        String[] parts = parseGcsUri(gcsUri);
        String bucketName = parts[0];
        String objectName = parts[1];
        
        log.info("Streaming audio from GCS: bucket={}, object={}", bucketName, objectName);
        
        try {
            Blob blob = storage.get(bucketName, objectName);
            
            if (blob == null) {
                throw new RuntimeException("File not found in GCS: " + gcsUri);
            }
            
            // Use reader() for streaming instead of getContent() which loads all into memory
            return Channels.newInputStream(blob.reader());
            
        } catch (Exception e) {
            log.error("Failed to stream from GCS: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
    }

    public byte[] getAudioBytesFromGcs(String gcsUri) {
        if (gcsUri == null || !gcsUri.startsWith("gs://")) {
            throw new IllegalArgumentException("Invalid GCS URI: " + gcsUri);
        }
        
        String[] parts = parseGcsUri(gcsUri);
        String bucketName = parts[0];
        String objectName = parts[1];
        
        log.info("Downloading audio from GCS: bucket={}, object={}", bucketName, objectName);
        
        try {
            Blob blob = storage.get(bucketName, objectName);
            
            if (blob == null) {
                throw new RuntimeException("File not found in GCS: " + gcsUri);
            }
            
            byte[] content = blob.getContent();
            log.info("Successfully downloaded {} bytes from GCS", content.length);
            
            return content;
            
        } catch (Exception e) {
            log.error("Failed to download from GCS: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to download from GCS: " + e.getMessage(), e);
        }
    }

    private String[] parseGcsUri(String gcsUri) {
        String[] parts = gcsUri.replace("gs://", "").split("/", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid GCS URI format: " + gcsUri);
        }
        return parts;
    }
    
    @Override
    public InputStream getAudioStream(Long audioFileId) {
        log.info("Getting audio stream for audio file ID: {}", audioFileId);
        
        User currentUser = securityUtils.getCurrentUser();
        AudioFile audioFile = audioRepository.findById(audioFileId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        if (!audioFile.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        if (audioFile.getStatus() != ProcessingStatus.COMPLETED) {
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
        
        if (audioFile.getGcsUri() == null || audioFile.getGcsUri().isEmpty()) {
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
        
        return getAudioStreamFromGcs(audioFile.getGcsUri());
    }

    @Override
    public byte[] getAudioBytes(Long audioFileId) {
        log.info("Getting audio bytes for audio file ID: {}", audioFileId);
        
        User currentUser = securityUtils.getCurrentUser();
        AudioFile audioFile = audioRepository.findById(audioFileId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        if (!audioFile.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        if (audioFile.getStatus() != ProcessingStatus.COMPLETED) {
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
        
        if (audioFile.getGcsUri() == null || audioFile.getGcsUri().isEmpty()) {
            throw new AppException(ErrorCode.AUDIO_FILE_PROCESSING_FAILED);
        }
        
        return getAudioBytesFromGcs(audioFile.getGcsUri());
    }

    @Override
    public void deleteAudioFile(Long audioFileId) {
        log.info("Deleting audio file ID: {}", audioFileId);
        
        User currentUser = securityUtils.getCurrentUser();
        
        AudioFile audioFile = audioRepository.findById(audioFileId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        if (!audioFile.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. Check if operation is still running - cannot delete if TTS is still processing
        if (audioFile.getOperationName() != null && !audioFile.getOperationName().isEmpty()) {
            try {
                LongAudioSynthesisResponse statusResponse = googleTtsService.checkLongAudioOperationStatus(
                        audioFile.getOperationName());
                
                if (!Boolean.TRUE.equals(statusResponse.getDone())) {
                    throw new AppException(ErrorCode.AUDIO_FILE_CANNOT_BE_DELETED);
                }
            } catch (Exception e) {
                if (audioFile.getStatus() == ProcessingStatus.GENERATING_AUDIO) {
                    throw new AppException(ErrorCode.AUDIO_FILE_CANNOT_BE_DELETED);
                }
            }
        }
        
        if (audioFile.getGcsUri() != null && !audioFile.getGcsUri().isEmpty()) {
            try {
                String[] parts = parseGcsUri(audioFile.getGcsUri());
                String bucketName = parts[0];
                String objectName = parts[1];
                storage.delete(bucketName, objectName);
            } catch (Exception e) {
                log.warn("Failed to delete file from GCS {}: {}. Continuing with database deletion.", 
                        audioFile.getGcsUri(), e.getMessage());
            }
        }
        
        audioRepository.delete(audioFile);
        log.info("Successfully deleted audio file ID: {}", audioFileId);
    }

    @Override
    public List<AudioFileDto> getAudioFiles(Long articleId) {
        NewsArticle newsArticle = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        User currentUser = securityUtils.getCurrentUser();

        List<AudioFile> audioFiles = audioRepository.findByUserAndNewsArticle(currentUser, newsArticle);

        return audioMapper.toDtoList(audioFiles);
    }

    @Override
    public Page<AudioFileDto> getAudioFilesByUser(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        Page<AudioFile> audioFiles = audioRepository.findByUser(currentUser, pageable);
        return audioFiles.map(audioMapper::toDto);
    }

    /**
     * Generate file name for audio file
     * 
     * @param article The article
     * @param voiceSettings Voice settings
     * @param isFromSummary Whether the audio is generated from summary (true) or full article (false)
     * @return Generated file name
     */
    private String generateAudioFileName(NewsArticle article, VoiceSettingsRequest voiceSettings, boolean isFromSummary) {
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String sanitizedTitle = article.getTitle()
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .toLowerCase();
        
        int maxTitleLength = isFromSummary ? 40 : 50;
        String prefix = isFromSummary ? "%s-summary-%s-%s.wav" : "%s-%s-%s.wav";
        
        return String.format(prefix, 
                sanitizedTitle.substring(0, Math.min(maxTitleLength, sanitizedTitle.length())),
                voiceSettings.getVoiceName().replace("-", "_"),
                timestamp);
    }
}

