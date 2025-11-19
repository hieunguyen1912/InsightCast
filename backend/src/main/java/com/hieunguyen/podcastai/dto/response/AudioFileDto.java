package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AudioFileDto {
    private Long id;

    private String operationName;
    private String gcsUri;

    private String fileName;

    private ProcessingStatus status;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;

    private String errorMessage;
    private String errorCode;
    private Integer retryCount;

    private TtsConfigDto ttsConfig;
    private Long articleId;
}