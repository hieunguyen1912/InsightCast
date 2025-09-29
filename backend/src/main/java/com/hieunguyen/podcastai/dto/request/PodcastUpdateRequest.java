package com.hieunguyen.podcastai.dto.request;

import com.hieunguyen.podcastai.enums.Visibility;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodcastUpdateRequest {
    
    @NotBlank(message = "Podcast title is required")
    @Size(min = 1, max = 200, message = "Podcast title must be between 1 and 200 characters")
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Visibility visibility;
    
    private Long categoryId;
    
    private String imageUrl;
}
