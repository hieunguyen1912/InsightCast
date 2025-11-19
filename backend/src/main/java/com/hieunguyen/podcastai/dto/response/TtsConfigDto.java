package com.hieunguyen.podcastai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TtsConfigDto {

    private Long id;
    private String name;
    private String description;
    private String languageCode;
    private String voiceName;
    private Double speakingRate;
    private Double pitch;
    private Double volumeGain;
    private String audioEncoding;
    private Integer sampleRateHertz;
    private Instant createdAt;
    private Instant updatedAt;
    private Long userId;
}
