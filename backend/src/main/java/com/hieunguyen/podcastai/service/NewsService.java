package com.hieunguyen.podcastai.service;


import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;

public interface NewsService {

    Page<NewsArticleResponse> searchNewsBySpecification(Pageable pageable, String... search);
    Optional<NewsArticleResponse> getNewsById(Long id);
    List<NewsArticleResponse> getLatestNews(int limit);
    List<NewsArticleResponse> getTrendingNews(int limit);
}