package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface UserFavoriteService {
    Page<UserFavoriteDto> getUserFavorites(Pageable pageable);
    UserFavoriteDto addFavorite(Long articleId);
    void removeFavorite(Long favoriteId);
}
