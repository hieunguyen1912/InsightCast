package com.hieunguyen.podcastai.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private String outputFileName;
}

