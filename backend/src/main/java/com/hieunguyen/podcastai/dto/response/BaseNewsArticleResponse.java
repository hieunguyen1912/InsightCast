package com.hieunguyen.podcastai.dto.response;

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
    private String url;
    private String sourceName;
    private String author;
    private Instant publishedAt;
    private String imageUrl;
    private String language;
    private Long viewCount;
    private Long likeCount;
    private Long shareCount;
}
