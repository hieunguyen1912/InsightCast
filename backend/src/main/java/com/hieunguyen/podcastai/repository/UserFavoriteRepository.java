package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.UserFavorite;
import com.hieunguyen.podcastai.enums.FavoriteType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    
    List<UserFavorite> findByUserId(Long userId);
    
    Optional<UserFavorite> findByIdAndUserId(Long id, Long userId);
    
    Optional<UserFavorite> findByUserIdAndEntityIdAndFavoriteType(Long userId, Long entityId, FavoriteType favoriteType);
    
    boolean existsByUserIdAndEntityIdAndFavoriteType(Long userId, Long entityId, FavoriteType favoriteType);
    
    void deleteByUserIdAndEntityIdAndFavoriteType(Long userId, Long entityId, FavoriteType favoriteType);
}
