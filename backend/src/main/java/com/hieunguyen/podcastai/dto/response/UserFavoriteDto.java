package com.hieunguyen.podcastai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoriteDto {
    
    private Long id;
    private Long articleId;
    private String articleTitle;
    private String articleDescription;
    private String articleImageUrl;
    private Instant createdAt;
}
