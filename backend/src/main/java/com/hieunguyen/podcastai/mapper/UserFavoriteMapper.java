package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.UserFavoriteRequest;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.entity.UserFavorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserFavoriteMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "favoriteType", source = "type")
    @Mapping(target = "entityId", source = "itemId")
    @Mapping(target = "notes", ignore = true)
    UserFavorite toEntity(UserFavoriteRequest request);

    @Mapping(target = "type", source = "favoriteType")
    @Mapping(target = "itemId", source = "entityId")
    @Mapping(target = "itemTitle", ignore = true)
    @Mapping(target = "itemDescription", ignore = true)
    @Mapping(target = "itemImageUrl", ignore = true)
    UserFavoriteDto toDto(UserFavorite userFavorite);
}
