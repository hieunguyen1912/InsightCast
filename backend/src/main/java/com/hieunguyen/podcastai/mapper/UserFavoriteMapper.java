package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.user.UserFavoriteRequest;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.entity.UserFavorite;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserFavoriteMapper {

    UserFavorite toEntity(UserFavoriteRequest request);

    UserFavoriteDto toDto(UserFavorite userFavorite);
}
