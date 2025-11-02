package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;

import com.hieunguyen.podcastai.service.NewsArticleService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
@Slf4j
@RequiredArgsConstructor
public class NewsController {
    private final NewsArticleService newsService;
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleResponse>>> search(
            Pageable pageable,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "fromDate", required = false) Instant fromDate,
            @RequestParam(value = "toDate", required = false) Instant toDate,
            @RequestParam(value = "keyword", required = false) String keyword) {
        log.info("API: Search news - keyword: {}", keyword);
        log.info("keyword: {}, categoryId: {}, fromDate: {}, toDate: {}",
                keyword, categoryId, fromDate, toDate);

        Page<NewsArticleResponse> newsArticles  = newsService.searchFullText(keyword, categoryId, fromDate, toDate, pageable);

        PaginatedResponse<NewsArticleResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(newsArticles);

        return ResponseEntity.ok(ApiResponse.success("News fetched successfully", paginatedResponse));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<NewsArticleSummaryResponse>>> getLatestNews(
        @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting latest {} news articles", limit);
        
        List<NewsArticleSummaryResponse> response = newsService.getLatestNews(limit);
        
        return ResponseEntity.ok(ApiResponse.success("Latest news fetched successfully", response));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<NewsArticleSummaryResponse>>> getTrendingNews(
        @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting trending {} news articles", limit);
        
        List<NewsArticleSummaryResponse> response = newsService.getTrendingNews(limit);
        
        return ResponseEntity.ok(ApiResponse.success("Trending news fetched successfully", response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<NewsArticleSummaryResponse>> getFeaturedArticle() {
        log.info("Getting featured article");
        
        return newsService.getFeaturedArticle()
            .map(response -> ResponseEntity.ok(ApiResponse.success("Featured article fetched successfully", response)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getNewsById(@PathVariable Long id) {
        log.info("Getting news article by ID: {}", id);
        
        return newsService.getNewsById(id)
            .map(response -> ResponseEntity.ok(ApiResponse.success("News article fetched successfully", response)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getByCategory(
            @PathVariable Long categoryId,
            Pageable pageable) {

        Page<NewsArticleSummaryResponse> newsArticles = newsService.findByCategoryId(categoryId, pageable);

        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(newsArticles);

        return ResponseEntity.ok(ApiResponse.success("News fetched successfully", paginatedResponse));
    }
}