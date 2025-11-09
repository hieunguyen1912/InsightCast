package com.hieunguyen.podcastai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AudioRequest {
    
    private VoiceSettingsRequest customVoiceSettings;

    @Builder.Default
    private Boolean enableSummarization = true;
    
    @Builder.Default
    private Boolean enableTranslation = false;
}