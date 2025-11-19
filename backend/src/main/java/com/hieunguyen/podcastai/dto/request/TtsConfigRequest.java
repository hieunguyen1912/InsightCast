package com.hieunguyen.podcastai.dto.request;

import com.hieunguyen.podcastai.enums.SampleRate;
import com.hieunguyen.podcastai.validator.ValidSampleRate;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TtsConfigRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Language code is required")
    @Size(max = 10, message = "Language code must not exceed 10 characters")
    @Pattern(regexp = "^[a-z]{2}-[A-Z]{2}$", message = "Language code must be in format 'xx-XX'")
    private String languageCode;

    @NotBlank(message = "Voice name is required")
    @Size(max = 50, message = "Voice name must not exceed 50 characters")
    private String voiceName;

    @NotNull(message = "Speaking rate is required")
    @DecimalMin(value = "0.25", message = "Speaking rate must be at least 0.25")
    @DecimalMax(value = "4.0", message = "Speaking rate must not exceed 4.0")
    private Double speakingRate;

    @NotNull(message = "Pitch is required")
    @DecimalMin(value = "-20.0", message = "Pitch must be at least -20.0")
    @DecimalMax(value = "20.0", message = "Pitch must not exceed 20.0")
    private Double pitch;

    @NotNull(message = "Volume gain is required")
    @DecimalMin(value = "-96.0", message = "Volume gain must be at least -96.0")
    @DecimalMax(value = "16.0", message = "Volume gain must not exceed 16.0")
    private Double volumeGain;

    @ValidSampleRate
    private SampleRate sampleRateHertz = SampleRate.RATE_24000;

}
