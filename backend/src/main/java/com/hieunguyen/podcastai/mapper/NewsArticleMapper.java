package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NewsArticleMapper {

    /**
     * Convert NewsArticle entity to NewsArticleResponse DTO (full data)
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
     * Convert NewsArticle entity to NewsArticleSummaryResponse DTO (lightweight)
     */
    public NewsArticleSummaryResponse toSummaryDto(NewsArticle entity) {
        if (entity == null) {
            return null;
        }

        return NewsArticleSummaryResponse.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .url(entity.getUrl())
            .sourceName(entity.getSourceName())
            .author(entity.getAuthor())
            .publishedAt(entity.getPublishedAt())
            .imageUrl(entity.getImageUrl())
            .language(entity.getLanguage())
            .viewCount(entity.getViewCount())
            .likeCount(entity.getLikeCount())
            .shareCount(entity.getShareCount())
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .newsSourceName(entity.getNewsSource() != null ? entity.getNewsSource().getDisplayName() : null)
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
     * Convert list of NewsArticle entities to list of NewsArticleSummaryResponse DTOs
     */
    public List<NewsArticleSummaryResponse> toSummaryDtoList(List<NewsArticle> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
            .map(this::toSummaryDto)
            .collect(Collectors.toList());
    }

    /**
     * Map Category entity to CategoryResponse DTO (full data)
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
     * Map NewsSource entity to NewsSourceResponse DTO (full data)
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
