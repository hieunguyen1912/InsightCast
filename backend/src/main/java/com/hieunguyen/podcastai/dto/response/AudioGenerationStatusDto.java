package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AudioGenerationStatusDto {
    private Long audioFileId;
    private ProcessingStatus status;
    private Double progressPercentage;
    private String errorMessage;
}

