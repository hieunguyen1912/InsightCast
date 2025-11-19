package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.dto.response.AudioGenerationStatusDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleToAudioService {

    AudioFileDto generateAudioFromArticle(Long articleId, AudioRequest request);

    AudioFileDto generateAudioFromSummary(Long articleId, AudioRequest request);

    AudioGenerationStatusDto checkAndUpdateAudioGenerationStatus(Long audioFileId);

    java.io.InputStream getAudioStream(Long audioFileId);

    byte[] getAudioBytes(Long audioFileId);

    void deleteAudioFile(Long audioFileId);

    List<AudioFileDto> getAudioFiles(Long articleId);

    Page<AudioFileDto> getAudioFilesByUser(Pageable pageable);
}
