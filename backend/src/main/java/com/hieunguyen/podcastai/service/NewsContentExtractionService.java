package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.entity.NewsArticle;

public interface NewsContentExtractionService {
    String extractFullContent(String url);
    NewsArticle enrichArticleWithFullContent(NewsArticle article);
}
