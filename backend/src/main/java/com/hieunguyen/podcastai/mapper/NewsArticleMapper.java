package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NewsArticleMapper {

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
            .viewCount(entity.getViewCount())
            .likeCount(entity.getLikeCount())
            .shareCount(entity.getShareCount())
            .category(mapCategory(entity))
            .build();
    }

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
            .viewCount(entity.getViewCount())
            .likeCount(entity.getLikeCount())
            .shareCount(entity.getShareCount())
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .build();
    }

    public List<NewsArticleResponse> toDtoList(List<NewsArticle> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<NewsArticleSummaryResponse> toSummaryDtoList(List<NewsArticle> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
            .map(this::toSummaryDto)
            .collect(Collectors.toList());
    }

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
}
