package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.PlaylistStatus;
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
public class PlaylistDto {
    
    private Long id;
    private String name;
    private String description;
    private Visibility visibility;
    private PlaylistStatus status;
    private Long userId;
    private String userUsername;
    private Integer episodeCount;
    private Instant createdAt;
    private Instant updatedAt;
}
