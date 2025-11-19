package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.RejectArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import com.hieunguyen.podcastai.service.ArticleService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/articles")
@Slf4j
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;

    @GetMapping("/pending-review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getPendingReviewArticles(
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size,
                @RequestParam(defaultValue = "createdAt") String sortBy,
                @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting pending review articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getPendingReviewArticles(pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("Pending review articles retrieved successfully", paginatedResponse));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsArticleSummaryResponse>> approveArticle(@PathVariable Long id) {
        log.info("Approving article with ID: {}", id);
        
        NewsArticleSummaryResponse article = articleService.approveArticle(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article approved successfully", article));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsArticleSummaryResponse>> rejectArticle(
            @PathVariable Long id,
            @Valid @RequestBody RejectArticleRequest request) {
        log.info("Rejecting article with ID: {}", id);
        
        NewsArticleSummaryResponse article = articleService.rejectArticle(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Article rejected successfully", article));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) ArticleStatus status,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String authorName) {
        
        log.info("Admin getting all articles - page: {}, size: {}, status: {}, categoryName: {}, authorName: {}", 
                page, size, status, categoryName, authorName);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getAllArticles(pageable, status, categoryName, authorName);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("All articles retrieved successfully", paginatedResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getArticleById(@PathVariable Long id) {
        log.info("Admin getting article with ID: {}", id);
        
        NewsArticleResponse article = articleService.getArticleByIdForAdmin(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article retrieved successfully", article));
    }

    @GetMapping("/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getApprovedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Admin getting approved articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getArticlesByStatus(ArticleStatus.APPROVED, pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("Approved articles retrieved successfully", paginatedResponse));
    }

    @GetMapping("/rejected")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getRejectedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Admin getting rejected articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getArticlesByStatus(ArticleStatus.REJECTED, pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("Rejected articles retrieved successfully", paginatedResponse));
    }

    @GetMapping("/drafts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getDraftArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Admin getting draft articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getArticlesByStatus(ArticleStatus.DRAFT, pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("Draft articles retrieved successfully", paginatedResponse));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        log.info("Admin deleting article with ID: {}", id);
        
        articleService.deleteArticleForAdmin(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateArticleJson(
            @PathVariable Long id,
            @Valid @RequestBody UpdateArticleRequest request) {
        log.info("Admin updating article with ID: {} (JSON)", id);
        
        NewsArticleResponse article = articleService.updateArticleForAdmin(id, request, null);
        
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", article));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateArticleMultipart(
            @PathVariable Long id,
            @RequestPart(value = "data") @Valid UpdateArticleRequest request,
            @RequestPart(value = "featuredImage", required = false) MultipartFile featuredImage) {
        log.info("Admin updating article with ID: {} (Multipart)", id);
        
        NewsArticleResponse article = articleService.updateArticleForAdmin(id, request, featuredImage);
        
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", article));
    }
}

