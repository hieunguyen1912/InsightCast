package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AudioFileDto {
    
    private Long id;
    private String title;
    private String description;
    private String originalText;
    private String sourceUrl;
    private String fileName;
    private String filePath;
    private Long fileSizeBytes;
    private Long durationSeconds;
    private Long playCount;
    private Long downloadCount;
    private Long likeCount;
    private ProcessingStatus status;
    private Boolean isPublic;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;
    
    // URLs for client access
    private String downloadUrl;
    private String streamUrl;
    
    // Relationships
    private UserDto user;
    private TtsConfigDto ttsConfig;
    private CategoryDto category;
    private List<TagDto> tags;
}