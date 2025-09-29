package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.UserFavoriteRequest;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;

import java.util.List;

public interface UserFavoriteService {
    List<UserFavoriteDto> getUserFavorites();
    UserFavoriteDto addFavorite(UserFavoriteRequest request);
    void removeFavorite(Long favoriteId);
    void removeFavoriteByItem(Long itemId, com.hieunguyen.podcastai.enums.FavoriteType type);
}
