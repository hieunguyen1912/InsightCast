package com.hieunguyen.podcastai.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AudioRequest {
    
    // Basic Information
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    // For NEWS_API source
    @NotBlank(message = "News article URL is required when content source is NEWS_API")
    @Pattern(regexp = "^https?://.*", message = "News article URL must be a valid HTTP/HTTPS URL")
    private String newsArticleUrl;
    
    // For TEXT_INPUT source
    @Size(max = 50000, message = "Text content must not exceed 50000 characters")
    private String textContent;
    
    // TTS Configuration - Hỗ trợ cả 2 trường hợp
    // Trường hợp 1: Sử dụng config có sẵn
    private Long ttsConfigId; // ID của TTS config đã lưu
    
    // Trường hợp 2: Tự cài đặt mới
    private VoiceSettingsRequest customVoiceSettings; // Cài đặt voice tùy chỉnh
    
    // Category and Tags
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private List<Long> tagIds;
    
    // Audio Settings
    @Builder.Default
    private Boolean isPublic = false;
    
    // Processing Options
    @Builder.Default
    private Boolean enableSummarization = true;
    
    @Builder.Default
    private Boolean enableTranslation = false;
    
    @Size(max = 10, message = "Target language code must not exceed 10 characters")
    @Pattern(regexp = "^[a-z]{2}-[A-Z]{2}$", message = "Target language code must be in format 'xx-XX'")
    private String targetLanguageCode;

    // Metadata
    private String author;
    private String sourceName;
    
    // Validation method
    @AssertTrue(message = "Either ttsConfigId or customVoiceSettings must be provided")
    public boolean isValidTtsConfiguration() {
        return (ttsConfigId != null) ^ (customVoiceSettings != null);
    }
}