package com.hieunguyen.podcastai.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NewsArticleResponse extends BaseNewsArticleResponse {

    private String content;
    private String summary;
    private UserDto author;
    private CategoryResponse category;
    private List<String> contentImageUrls;

    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }
}
