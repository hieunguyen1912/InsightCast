package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.entity.NewsArticle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleResponse {

    private Long id;
    private String title;
    private String description;
    private String content;
    private String url;
    private String sourceName;
    private String author;
    private Instant publishedAt;
    private String imageUrl;
    private String language;
    private Long viewCount;
    private Long likeCount;
    private Long shareCount;

    // Nested objects (avoid lazy loading)
    private CategoryResponse category;
    private NewsSourceResponse newsSource;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewsSourceResponse {
        private Long id;
        private String name;
        private String displayName;
        private String url;
    }

}
