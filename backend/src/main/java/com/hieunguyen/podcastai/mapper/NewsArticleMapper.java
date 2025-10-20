package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NewsArticleMapper {

    /**
     * Convert NewsArticle entity to NewsArticleResponse DTO
     */
    public NewsArticleResponse toDto(NewsArticle entity) {
        if (entity == null) {
            return null;
        }

        return NewsArticleResponse.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .content(entity.getContent())
            .url(entity.getUrl())
            .sourceName(entity.getSourceName())
            .author(entity.getAuthor())
            .publishedAt(entity.getPublishedAt())
            .imageUrl(entity.getImageUrl())
            .language(entity.getLanguage())
            .viewCount(entity.getViewCount())
            .likeCount(entity.getLikeCount())
            .shareCount(entity.getShareCount())
            .category(mapCategory(entity))
            .newsSource(mapNewsSource(entity))
            .build();
    }

    /**
     * Convert list of NewsArticle entities to list of NewsArticleResponse DTOs
     */
    public List<NewsArticleResponse> toDtoList(List<NewsArticle> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Map Category entity to CategoryResponse DTO
     */
    private NewsArticleResponse.CategoryResponse mapCategory(NewsArticle entity) {
        if (entity.getCategory() == null) {
            return null;
        }

        return NewsArticleResponse.CategoryResponse.builder()
            .id(entity.getCategory().getId())
            .name(entity.getCategory().getName())
            .description(entity.getCategory().getDescription())
            .build();
    }

    /**
     * Map NewsSource entity to NewsSourceResponse DTO
     */
    private NewsArticleResponse.NewsSourceResponse mapNewsSource(NewsArticle entity) {
        if (entity.getNewsSource() == null) {
            return null;
        }

        return NewsArticleResponse.NewsSourceResponse.builder()
            .id(entity.getNewsSource().getId())
            .name(entity.getNewsSource().getName())
            .displayName(entity.getNewsSource().getDisplayName())
            .url(entity.getNewsSource().getUrl())
            .build();
    }
}
