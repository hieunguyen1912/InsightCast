package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserFavorite;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.repository.UserFavoriteRepository;
import com.hieunguyen.podcastai.service.UserFavoriteService;
import com.hieunguyen.podcastai.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserFavoriteServiceImpl implements UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final SecurityUtils securityUtils;
    private final NewsArticleRepository newsArticleRepository;

    @Override
    public Page<UserFavoriteDto> getUserFavorites(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        Page<UserFavorite> favorites = userFavoriteRepository.findByUserId(currentUser.getId(), pageable);

        return favorites.map(this::toDto);
    }

    @Override
    @Transactional
    public UserFavoriteDto addFavorite(Long articleId) {
        log.info("Adding favorite for article ID: {}", articleId);
        User currentUser = securityUtils.getCurrentUser();

        NewsArticle article = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        if (Boolean.TRUE.equals(userFavoriteRepository.existsByUserIdAndNewsArticleId(currentUser.getId(), articleId))) {
            log.warn("Favorite already exists for user: {} and article: {}", currentUser.getEmail(), articleId);
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        
        UserFavorite favorite = UserFavorite.builder()
                .user(currentUser)
                .newsArticle(article)
                .build();
        
        UserFavorite savedFavorite = userFavoriteRepository.save(favorite);
        
        // Increment like count
        article.setLikeCount(article.getLikeCount() + 1);
        newsArticleRepository.save(article);
        log.info("Incremented like count for article ID: {}, new count: {}", articleId, article.getLikeCount());
        
        log.info("Successfully added favorite for user: {} and article: {}", currentUser.getEmail(), articleId);
        return toDto(savedFavorite);
    }

    private UserFavoriteDto toDto(UserFavorite favorite) {
        if (favorite == null) {
            return null;
        }
        
        NewsArticle article = favorite.getNewsArticle();
        
        return UserFavoriteDto.builder()
                .id(favorite.getId())
                .articleId(article != null ? article.getId() : null)
                .articleTitle(article != null ? article.getTitle() : null)
                .articleDescription(article != null ? article.getDescription() : null)
                .articleImageUrl(article != null ? article.getFeaturedImage() : null)
                .createdAt(favorite.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void removeFavorite(Long favoriteId) {
        log.info("Removing favorite with ID: {}", favoriteId);
        User currentUser = securityUtils.getCurrentUser();
        
        UserFavorite favorite = userFavoriteRepository.findByIdAndUserId(favoriteId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        NewsArticle article = favorite.getNewsArticle();
        
        userFavoriteRepository.delete(favorite);
        
        // Decrement like count
        if (article != null && article.getLikeCount() > 0) {
            article.setLikeCount(article.getLikeCount() - 1);
            newsArticleRepository.save(article);
            log.info("Decremented like count for article ID: {}, new count: {}", article.getId(), article.getLikeCount());
        }
        
        log.info("Successfully removed favorite for user: {}", currentUser.getEmail());
    }

}
