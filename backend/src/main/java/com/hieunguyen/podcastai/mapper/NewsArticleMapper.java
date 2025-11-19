package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface NewsArticleMapper {

    @Mapping(target = "category", source = ".", qualifiedByName = "mapCategory")
    @Mapping(target = "author", source = "author")
    @Mapping(target = "contentImageUrls", source = "articleImages", qualifiedByName = "mapContentImageUrls")
    NewsArticleResponse toDto(NewsArticle entity);

    @Named("mapContentImageUrls")
    default List<String> mapContentImageUrls(List<com.hieunguyen.podcastai.entity.ArticleImage> articleImages) {
        if (articleImages == null || articleImages.isEmpty()) {
            return List.of();
        }
        return articleImages.stream()
                .map(com.hieunguyen.podcastai.entity.ArticleImage::getUrl)
                .toList();
    }

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "authorName", source = "author", qualifiedByName = "mapAuthorName")
    NewsArticleSummaryResponse toSummaryDto(NewsArticle entity);

    List<NewsArticleResponse> toDtoList(List<NewsArticle> entities);

    List<NewsArticleSummaryResponse> toSummaryDtoList(List<NewsArticle> entities);

    @Named("mapCategory")
    default NewsArticleResponse.CategoryResponse mapCategory(NewsArticle entity) {
        if (entity == null || entity.getCategory() == null) {
            return null;
        }

        return NewsArticleResponse.CategoryResponse.builder()
            .id(entity.getCategory().getId())
            .name(entity.getCategory().getName())
            .description(entity.getCategory().getDescription())
            .build();
    }

    @Named("mapAuthorName")
    default String mapAuthorName(com.hieunguyen.podcastai.entity.User author) {
        if (author == null) {
            return null;
        }
        // Try to get username first, then fallback to firstName + lastName
        if (author.getUsername() != null && !author.getUsername().isEmpty()) {
            return author.getUsername();
        }
        if (author.getFirstName() != null || author.getLastName() != null) {
            String firstName = author.getFirstName() != null ? author.getFirstName() : "";
            String lastName = author.getLastName() != null ? author.getLastName() : "";
            return (firstName + " " + lastName).trim();
        }
        return null;
    }
}
