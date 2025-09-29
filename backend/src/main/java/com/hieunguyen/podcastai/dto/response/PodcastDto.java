package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.PodcastStatus;
import com.hieunguyen.podcastai.enums.Visibility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodcastDto {
    
    private Long id;
    private String title;
    private String description;
    private Visibility visibility;
    private PodcastStatus status;
    private Long userId;
    private String userUsername;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private Integer episodeCount;
    private Instant createdAt;
    private Instant updatedAt;
}
