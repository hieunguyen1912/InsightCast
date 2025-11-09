package com.hieunguyen.podcastai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Google Cloud Text-to-Speech Long Audio Synthesis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongAudioSynthesisResponse {

    /**
     * Operation name for tracking the long-running operation
     */
    private String operationName;

    /**
     * GCS URI where the audio file will be stored
     */
    private String outputGcsUri;

    /**
     * Current progress percentage (0-100)
     */
    private Integer progressPercentage;

    /**
     * Whether the operation is done
     */
    private Boolean done;

    /**
     * Audio encoding format
     */
    private String audioEncoding;

    /**
     * Sample rate in Hz
     */
    private Integer sampleRateHertz;

    /**
     * Language code used
     */
    private String languageCode;

    /**
     * Voice name used
     */
    private String voiceName;

    /**
     * Speaking rate used
     */
    private Double speakingRate;

    /**
     * Pitch used
     */
    private Double pitch;

    /**
     * Volume gain used
     */
    private Double volumeGain;

    /**
     * When the synthesis was initiated
     */
    private LocalDateTime startedAt;

    /**
     * Last update time
     */
    private LocalDateTime lastUpdateTime;

    /**
     * Estimated duration in milliseconds
     */
    private Long estimatedDurationMs;

    /**
     * Error message if operation failed
     */
    private String errorMessage;
}

