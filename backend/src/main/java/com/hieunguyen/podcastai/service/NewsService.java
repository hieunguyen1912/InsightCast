package com.hieunguyen.podcastai.service;


import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;

public interface NewsService {

    Page<NewsArticleResponse> searchNewsBySpecification(Pageable pageable, String... search);
    Optional<NewsArticleResponse> getNewsById(Long id);
    List<NewsArticleSummaryResponse> getLatestNews(int limit);
    List<NewsArticleSummaryResponse> getTrendingNews(int limit);
    Optional<NewsArticleSummaryResponse> getFeaturedArticle();
}