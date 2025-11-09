package com.hieunguyen.podcastai.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongAudioSynthesisResponse {
    private String operationName;
    private String outputGcsUri;

    private Double progressPercentage;

    private Boolean done;

    private LocalDateTime startedAt;

    private LocalDateTime lastUpdateTime;

    private String errorMessage;
}

