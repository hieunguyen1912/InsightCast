package com.hieunguyen.podcastai.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Google Cloud Text-to-Speech Long Audio Synthesis
 * Supports up to 1MB of input text
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongAudioSynthesisRequest {

    @NotBlank(message = "Text to synthesize cannot be blank")
    @Size(max = 1048576, message = "Text cannot exceed 1MB (1,048,576 characters)")
    private String text;

    @NotNull(message = "Voice settings cannot be null")
    @Valid
    private VoiceSettingsRequest voiceSettings;

    /**
     * Optional: Custom GCS bucket name. If not provided, uses default from configuration
     */
    private String outputGcsBucketName;

    /**
     * Optional: Custom file name in GCS. If not provided, generates automatically
     */
    private String outputFileName;
}

