package com.hieunguyen.podcastai.dto.request;

import com.hieunguyen.podcastai.enums.AudioEncoding;
import com.hieunguyen.podcastai.enums.SampleRate;
import com.hieunguyen.podcastai.validator.ValidAudioEncoding;
import com.hieunguyen.podcastai.validator.ValidSampleRate;
import jakarta.validation.constraints.*;
import lombok.*;


@Getter
@Setter
@Builder
@AllArgsConstructor
public class VoiceSettingsRequest {

    @NotBlank(message = "Language code cannot be blank")
    @Size(max = 10, message = "Language code must not exceed 10 characters")
    @Pattern(regexp = "^[a-z]{2}-[A-Z]{2}$", message = "Language code must be in format 'xx-XX' (e.g., en-US, vi-VN)")
    private String languageCode;

    @NotBlank(message = "Voice name cannot be blank")
    @Size(max = 50, message = "Voice name must not exceed 50 characters")
    private String voiceName;

    @NotNull(message = "Speaking rate cannot be null")
    @DecimalMin(value = "0.25", message = "Speaking rate must be at least 0.25")
    @DecimalMax(value = "4.0", message = "Speaking rate must not exceed 4.0")
    private Double speakingRate;

    @NotNull(message = "Pitch cannot be null")
    @DecimalMin(value = "-20.0", message = "Pitch must be at least -20.0")
    @DecimalMax(value = "20.0", message = "Pitch must not exceed 20.0")
    private Double pitch;

    @NotNull(message = "Volume gain cannot be null")
    @DecimalMin(value = "-96.0", message = "Volume gain must be at least -96.0")
    @DecimalMax(value = "16.0", message = "Volume gain must not exceed 16.0")
    private Double volumeGain;

    @ValidAudioEncoding
    @Builder.Default
    private AudioEncoding audioEncoding = AudioEncoding.MP3;

    @ValidSampleRate
    @Builder.Default
    private SampleRate sampleRateHertz = SampleRate.DEFAULT;
}
