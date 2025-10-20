package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
@Slf4j
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> search(Pageable pageable, 
        @RequestParam(value = "search", required = false) String... search) {
        
        log.info("Searching news with criteria: {}", (Object) search);
        
        Page<NewsArticleResponse> responsePage = newsService.searchNewsBySpecification(pageable, search);
        
        return ResponseEntity.ok(ApiResponse.success("News fetched successfully", responsePage, ApiResponse.PageInfo.from(responsePage)));
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
}