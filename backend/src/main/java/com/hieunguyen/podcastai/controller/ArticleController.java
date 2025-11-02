package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/articles")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")  // All endpoints require authentication
public class ArticleController {

    private final ArticleService articleService;

    /**
     * POST /api/v1/articles - Create new article (DRAFT)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<NewsArticleResponse>> createArticle(
            @Valid @RequestBody CreateArticleRequest request) {
        log.info("Creating new article with title: {}", request.getTitle());
        
        NewsArticleResponse article = articleService.createArticle(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Article created successfully", article));
    }

    /**
     * GET /api/v1/articles/my-drafts - Get my DRAFT articles
     */
    @GetMapping("/my-drafts")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyDrafts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting draft articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyDrafts(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Draft articles retrieved successfully", articles));
    }

    /**
     * GET /api/v1/articles/my-submitted - Get my PENDING_REVIEW articles
     */
    @GetMapping("/my-submitted")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMySubmitted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting submitted articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMySubmitted(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Submitted articles retrieved successfully", articles));
    }

    /**
     * GET /api/v1/articles/my-approved - Get my APPROVED articles
     */
    @GetMapping("/my-approved")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyApproved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting approved articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyApproved(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Approved articles retrieved successfully", articles));
    }

    /**
     * GET /api/v1/articles/my-rejected - Get my REJECTED articles
     */
    @GetMapping("/my-rejected")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyRejected(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting rejected articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyRejected(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Rejected articles retrieved successfully", articles));
    }

    /**
     * GET /api/v1/articles/my-all - Get all my articles
     */
    @GetMapping("/my-all")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting all my articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyAllArticles(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("All articles retrieved successfully", articles));
    }

    /**
     * GET /api/v1/articles/{id} - Get article detail
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getArticleById(@PathVariable Long id) {
        log.info("Getting article with ID: {}", id);
        
        NewsArticleResponse article = articleService.getArticleById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article retrieved successfully", article));
    }

    /**
     * PUT /api/v1/articles/{id} - Update article (only DRAFT or REJECTED)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody UpdateArticleRequest request) {
        log.info("Updating article with ID: {}", id);
        
        NewsArticleResponse article = articleService.updateArticle(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", article));
    }

    /**
     * DELETE /api/v1/articles/{id} - Delete article (only DRAFT)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        log.info("Deleting article with ID: {}", id);
        
        articleService.deleteArticle(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    /**
     * POST /api/v1/articles/{id}/submit - Submit article for review (DRAFT -> PENDING_REVIEW)
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> submitForReview(@PathVariable Long id) {
        log.info("Submitting article with ID: {} for review", id);
        
        NewsArticleResponse article = articleService.submitForReview(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article submitted for review successfully", article));
    }
}

