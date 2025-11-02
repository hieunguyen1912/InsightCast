package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class GNewsResponse {
    @JsonProperty("totalArticles")
    private int totalArticles;
    
    @JsonProperty("articles")
    private List<Article> articles;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Article {
        private String id;
        private String title;
        private String description;
        private String content;
        private String url;
        private String image;
        
        @JsonProperty("publishedAt")
        private String publishedAt;
        
        @JsonProperty("lang")
        private String lang;
        
        private Source source;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Source {
        private String id;
        private String name;
        private String url;
        private String country;
    }
}
