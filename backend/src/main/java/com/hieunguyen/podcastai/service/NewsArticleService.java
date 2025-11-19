package com.hieunguyen.podcastai.service;


import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;

public interface NewsArticleService {

    Page<NewsArticleResponse> searchFullText(
            String keyword,
            Long categoryId,
            Instant fromDate,
            Instant toDate,
            Pageable pageable);
    Page<NewsArticleSummaryResponse> findByCategoryId(Long categoryId, Pageable pageable);
    Optional<NewsArticleResponse> getNewsById(Long id);
    List<NewsArticleSummaryResponse> getLatestNews(int limit);
    List<NewsArticleSummaryResponse> getTrendingNews(int limit);
    Optional<NewsArticleSummaryResponse> getFeaturedArticle();


}