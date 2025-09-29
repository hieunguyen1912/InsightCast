package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.PodcastCreateRequest;
import com.hieunguyen.podcastai.dto.request.PodcastUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PodcastDto;
import com.hieunguyen.podcastai.entity.Podcast;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PodcastMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "coverImageUrl", source = "imageUrl")
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isFeatured", ignore = true)
    @Mapping(target = "totalEpisodes", ignore = true)
    @Mapping(target = "totalDurationSeconds", ignore = true)
    @Mapping(target = "totalPlays", ignore = true)
    @Mapping(target = "totalLikes", ignore = true)
    @Mapping(target = "totalShares", ignore = true)
    @Mapping(target = "publicUrl", ignore = true)
    @Mapping(target = "rssFeedUrl", ignore = true)
    @Mapping(target = "episodes", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "tags", ignore = true)
    Podcast toEntity(PodcastCreateRequest request);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "coverImageUrl", source = "imageUrl")
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isFeatured", ignore = true)
    @Mapping(target = "totalEpisodes", ignore = true)
    @Mapping(target = "totalDurationSeconds", ignore = true)
    @Mapping(target = "totalPlays", ignore = true)
    @Mapping(target = "totalLikes", ignore = true)
    @Mapping(target = "totalShares", ignore = true)
    @Mapping(target = "publicUrl", ignore = true)
    @Mapping(target = "rssFeedUrl", ignore = true)
    @Mapping(target = "episodes", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "tags", ignore = true)
    Podcast toEntity(PodcastUpdateRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userUsername", source = "user.username")
    @Mapping(target = "categoryId", expression = "java(podcast.getCategories() != null && !podcast.getCategories().isEmpty() ? podcast.getCategories().get(0).getId() : null)")
    @Mapping(target = "categoryName", expression = "java(podcast.getCategories() != null && !podcast.getCategories().isEmpty() ? podcast.getCategories().get(0).getName() : null)")
    @Mapping(target = "imageUrl", source = "coverImageUrl")
    @Mapping(target = "episodeCount", expression = "java(podcast.getEpisodes() != null ? podcast.getEpisodes().size() : 0)")
    PodcastDto toDto(Podcast podcast);
}
