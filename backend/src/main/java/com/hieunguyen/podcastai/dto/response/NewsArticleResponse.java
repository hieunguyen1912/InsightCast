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
    private UserDto author;
    private CategoryResponse category;

    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }
}
