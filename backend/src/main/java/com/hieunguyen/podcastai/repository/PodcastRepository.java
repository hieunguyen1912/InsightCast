package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Podcast;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PodcastRepository extends JpaRepository<Podcast, Long> {
    
    List<Podcast> findByUserId(Long userId);
    
    Optional<Podcast> findByIdAndUserId(Long id, Long userId);
    
    List<Podcast> findByUserIdAndStatus(Long userId, com.hieunguyen.podcastai.enums.PodcastStatus status);
    
    List<Podcast> findByUserIdAndVisibility(Long userId, com.hieunguyen.podcastai.enums.Visibility visibility);
    
    @Query("SELECT p FROM Podcast p JOIN p.categories c WHERE c.id = :categoryId")
    List<Podcast> findByCategoryId(@Param("categoryId") Long categoryId);
}
