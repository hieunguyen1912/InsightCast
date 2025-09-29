package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.UserFavoriteRequest;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserFavorite;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.UserFavoriteMapper;
import com.hieunguyen.podcastai.repository.UserFavoriteRepository;
import com.hieunguyen.podcastai.service.UserFavoriteService;
import com.hieunguyen.podcastai.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserFavoriteServiceImpl implements UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final UserFavoriteMapper userFavoriteMapper;
    private final SecurityUtils securityUtils;

    @Override
    public List<UserFavoriteDto> getUserFavorites() {
        log.debug("Retrieving user favorites");
        User currentUser = securityUtils.getCurrentUser();
        List<UserFavorite> favorites = userFavoriteRepository.findByUserId(currentUser.getId());
        log.debug("Found {} favorites for user: {}", favorites.size(), currentUser.getEmail());
        return favorites.stream()
                .map(userFavoriteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserFavoriteDto addFavorite(UserFavoriteRequest request) {
        log.info("Adding favorite for user");
        User currentUser = securityUtils.getCurrentUser();
        
        // Check if favorite already exists
        if (userFavoriteRepository.existsByUserIdAndEntityIdAndFavoriteType(
                currentUser.getId(), request.getItemId(), request.getType())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        
        UserFavorite favorite = userFavoriteMapper.toEntity(request);
        favorite.setUser(currentUser);
        
        UserFavorite savedFavorite = userFavoriteRepository.save(favorite);
        log.info("Successfully added favorite for user: {}", currentUser.getEmail());
        return userFavoriteMapper.toDto(savedFavorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long favoriteId) {
        log.info("Removing favorite with ID: {}", favoriteId);
        User currentUser = securityUtils.getCurrentUser();
        
        UserFavorite favorite = userFavoriteRepository.findByIdAndUserId(favoriteId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        userFavoriteRepository.delete(favorite);
        log.info("Successfully removed favorite for user: {}", currentUser.getEmail());
    }

    @Override
    @Transactional
    public void removeFavoriteByItem(Long itemId, com.hieunguyen.podcastai.enums.FavoriteType type) {
        log.info("Removing favorite by item ID: {} and type: {}", itemId, type);
        User currentUser = securityUtils.getCurrentUser();
        
        UserFavorite favorite = userFavoriteRepository.findByUserIdAndEntityIdAndFavoriteType(
                currentUser.getId(), itemId, type)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        userFavoriteRepository.delete(favorite);
        log.info("Successfully removed favorite for user: {}", currentUser.getEmail());
    }

}
