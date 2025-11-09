package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.RejectArticleRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.service.ArticleService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}

