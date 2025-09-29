package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Playlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    
    List<Playlist> findByUserId(Long userId);
    
    Optional<Playlist> findByIdAndUserId(Long id, Long userId);
    
    List<Playlist> findByUserIdAndStatus(Long userId, com.hieunguyen.podcastai.enums.PlaylistStatus status);
    
    List<Playlist> findByUserIdAndVisibility(Long userId, com.hieunguyen.podcastai.enums.Visibility visibility);
}
