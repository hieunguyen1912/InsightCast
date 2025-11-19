package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.GenerateSummaryRequest;
import com.hieunguyen.podcastai.dto.request.RejectArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ArticleService {
    
    // Create article (DRAFT status)
    NewsArticleResponse createArticle(CreateArticleRequest request,
                                      MultipartFile featuredImage,
                                      List<MultipartFile> contentImages);
    
    // Get my articles by status
    Page<NewsArticleSummaryResponse> getMyDrafts(Pageable pageable);
    
    Page<NewsArticleResponse> getMySubmitted(Pageable pageable);
    
    Page<NewsArticleResponse> getMyApproved(Pageable pageable);
    
    Page<NewsArticleResponse> getMyRejected(Pageable pageable);
    
    Page<NewsArticleResponse> getMyAllArticles(Pageable pageable);
    
    // Get article detail
    NewsArticleResponse getArticleById(Long id);
    
    // Update article (only DRAFT or REJECTED)
    NewsArticleResponse updateArticle(Long id, UpdateArticleRequest request, MultipartFile featuredImage);
    
    // Delete article (only DRAFT)
    void deleteArticle(Long id);
    
    // Submit article for review (DRAFT -> PENDING_REVIEW)
    NewsArticleResponse submitForReview(Long id);
    
    // Admin methods
    Page<NewsArticleSummaryResponse> getPendingReviewArticles(Pageable pageable);
    
    NewsArticleSummaryResponse approveArticle(Long id);
    
    NewsArticleSummaryResponse rejectArticle(Long id, RejectArticleRequest request);

    Page<NewsArticleSummaryResponse> getArticlesByCategory(Long id, Pageable pageable);

    String generateSummary(GenerateSummaryRequest request);
    
    // Admin methods for managing all articles
    Page<NewsArticleSummaryResponse> getAllArticles(Pageable pageable, ArticleStatus status, String categoryName, String authorName);
    
    NewsArticleResponse getArticleByIdForAdmin(Long id);
    
    Page<NewsArticleSummaryResponse> getArticlesByStatus(ArticleStatus status, Pageable pageable);
    
    void deleteArticleForAdmin(Long id);
    
    NewsArticleResponse updateArticleForAdmin(Long id, UpdateArticleRequest request, MultipartFile featuredImage);
}

