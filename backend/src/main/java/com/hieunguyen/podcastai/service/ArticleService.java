package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleService {
    
    // Create article (DRAFT status)
    NewsArticleResponse createArticle(CreateArticleRequest request);
    
    // Get my articles by status
    Page<NewsArticleResponse> getMyDrafts(Pageable pageable);
    
    Page<NewsArticleResponse> getMySubmitted(Pageable pageable);
    
    Page<NewsArticleResponse> getMyApproved(Pageable pageable);
    
    Page<NewsArticleResponse> getMyRejected(Pageable pageable);
    
    Page<NewsArticleResponse> getMyAllArticles(Pageable pageable);
    
    // Get article detail
    NewsArticleResponse getArticleById(Long id);
    
    // Update article (only DRAFT or REJECTED)
    NewsArticleResponse updateArticle(Long id, UpdateArticleRequest request);
    
    // Delete article (only DRAFT)
    void deleteArticle(Long id);
    
    // Submit article for review (DRAFT -> PENDING_REVIEW)
    NewsArticleResponse submitForReview(Long id);
}

