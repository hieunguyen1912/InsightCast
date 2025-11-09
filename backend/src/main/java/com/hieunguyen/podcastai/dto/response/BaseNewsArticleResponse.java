package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseNewsArticleResponse {

    private Long id;
    private String title;
    private String description;
    private String slug;
    private Instant publishedAt;
    private String featuredImage;
    private Long viewCount;
    private Long likeCount;
    private Long shareCount;
    private ArticleStatus status;
    private String rejectionReason;
}
