package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.PlaylistCreateRequest;
import com.hieunguyen.podcastai.dto.request.PlaylistUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PlaylistDto;
import com.hieunguyen.podcastai.entity.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "sortOrder", ignore = true)
    @Mapping(target = "episodeCount", ignore = true)
    @Mapping(target = "playlistEpisodes", ignore = true)
    Playlist toEntity(PlaylistCreateRequest request);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "sortOrder", ignore = true)
    @Mapping(target = "episodeCount", ignore = true)
    @Mapping(target = "playlistEpisodes", ignore = true)
    Playlist toEntity(PlaylistUpdateRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userUsername", source = "user.username")
    @Mapping(target = "episodeCount", source = "episodeCount")
    PlaylistDto toDto(Playlist playlist);
}
