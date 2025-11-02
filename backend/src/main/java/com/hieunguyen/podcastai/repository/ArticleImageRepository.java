package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.ArticleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleImageRepository extends JpaRepository<ArticleImage, Long> {
    
    List<ArticleImage> findByArticleId(Long articleId);
    
    List<ArticleImage> findByArticleIdOrderByCreatedAtDesc(Long articleId);
    
}

