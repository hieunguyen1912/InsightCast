package com.hieunguyen.podcastai.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NewsArticleResponse extends BaseNewsArticleResponse {

    private String content;

    private CategoryResponse category;
    private NewsSourceResponse newsSource;

    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class NewsSourceResponse {
        private Long id;
        private String name;
        private String displayName;
        private String url;
    }
}
