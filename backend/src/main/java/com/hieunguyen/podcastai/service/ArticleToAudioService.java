package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.TtsConfig;

/**
 * Service for converting articles to audio files
 */
public interface ArticleToAudioService {
    
    /**
     * Convert article to audio file synchronously
     * 
     * @param article Article to convert
     * @param ttsConfig TTS configuration (optional, can use default)
     * @return AudioFile entity
     */
    AudioFile convertArticleToAudio(NewsArticle article, TtsConfig ttsConfig);
    
    /**
     * Convert article to audio asynchronously
     * 
     * @param article Article to convert
     * @param ttsConfig TTS configuration (optional, can use default)
     */
    void convertArticleToAudioAsync(NewsArticle article, TtsConfig ttsConfig);
    
    /**
     * Create AudioFile entity with PENDING status immediately
     * 
     * @param article Article to convert
     * @param ttsConfig TTS configuration (optional)
     * @return AudioFile entity with PENDING status
     */
    AudioFile createPendingAudioFile(NewsArticle article, TtsConfig ttsConfig);
    
    /**
     * Update audio file status and error information
     * 
     * @param audioFileId Audio file ID
     * @param status New status
     * @param errorMessage Error message (if failed)
     */
    void updateAudioFileStatus(Long audioFileId, com.hieunguyen.podcastai.enums.ProcessingStatus status, String errorMessage);
}

