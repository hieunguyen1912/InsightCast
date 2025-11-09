package com.hieunguyen.podcastai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ProcessingStatus;

public interface AudioRepository extends JpaRepository<AudioFile, Long> {
    
    Optional<AudioFile> findByIdAndUser(Long id, User user);
    
    List<AudioFile> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<AudioFile> findFirstByNewsArticleOrderByCreatedAtDesc(NewsArticle newsArticle);
    
    List<AudioFile> findByNewsArticleAndStatus(NewsArticle newsArticle, ProcessingStatus status);
    
}
