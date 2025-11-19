package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.UserFavorite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    
    Page<UserFavorite> findByUserId(Long userId, Pageable pageable);

    Boolean existsByUserIdAndNewsArticleId(Long userId, Long newsArticleId);
    
    Optional<UserFavorite> findByUserIdAndNewsArticleId(Long userId, Long newsArticleId);
    
    Optional<UserFavorite> findByIdAndUserId(Long id, Long userId);
}
