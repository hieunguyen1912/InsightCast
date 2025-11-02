package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.NewsSource;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.repository.NewsSourceRepository;
import com.hieunguyen.podcastai.service.NewsAggregationService;
import com.hieunguyen.podcastai.service.NewsContentExtractionService;
import com.hieunguyen.podcastai.service.NewsSourceFactory;
import com.hieunguyen.podcastai.service.NewsSourceIntegrationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NewsAggregationServiceImpl implements NewsAggregationService {

    private final NewsSourceFactory newsSourceFactory;
    private final NewsSourceRepository newsSourceRepository;
    private final NewsArticleRepository newsArticleRepository;
    private final NewsContentExtractionService newsContentExtractionService;

    @Override
    @Transactional
    public int fetchAllNews() {
        log.info("Starting to fetch news from all active sources");
        
        List<NewsSource> activeSources = newsSourceRepository.findByIsActiveTrue();
        int totalArticles = 0;
        
        for (NewsSource source : activeSources) {
            try {
                int articlesCount = fetchNewsFromSource(source.getId());
                totalArticles += articlesCount;
                log.info("Fetched {} articles from source: {}", articlesCount, source.getName());
            } catch (Exception e) {
                log.error("Failed to fetch from source {}: {}", source.getName(), e.getMessage(), e);
                updateSourceStatus(source, false, 0);
            }
        }
        
        log.info("Completed fetching news. Total articles: {}", totalArticles);
        return totalArticles;
    }

    @Override
    @Transactional
    public int fetchNewsFromSource(Long sourceId) {
        NewsSource source = newsSourceRepository.findById(sourceId)
            .orElseThrow(() -> new RuntimeException("Source not found: " + sourceId));
        
        if (Boolean.FALSE.equals(source.getIsActive())) {
            log.warn("Source {} is inactive", source.getName());
            return 0;
        }
        
        log.info("Fetching news from source: {} (type: {})", source.getName(), source.getType().name());
        
        NewsSourceIntegrationService integrationService = newsSourceFactory.createService(source);
        List<NewsArticle> articles = integrationService.fetchNews(source);
        
        int savedCount = processAndSaveArticles(articles, source);
        updateSourceStatus(source, true, savedCount);
        
        return savedCount;
    }

    @Override
    @Transactional
    public int processAndSaveArticles(List<NewsArticle> articles, NewsSource source) {
        if (articles == null || articles.isEmpty()) {
            return 0;
        }
        
        log.info("Processing {} articles from source: {}", articles.size(), source.getName());
        
        int savedCount = 0;
        
        for (NewsArticle article : articles) {
            try {
                if (article.getContent() == null || article.getContent().length() < 500) {
                    newsContentExtractionService.enrichArticleWithFullContent(article);
                }

                // Check if article already exists
                Optional<NewsArticle> existingArticle = newsArticleRepository
                    .findByUrl(article.getUrl());
                
                if (existingArticle.isPresent()) {
                    // Update existing article
                    NewsArticle existing = existingArticle.get();
                    existing.setViewCount(existing.getViewCount() + 1); // Increment view count
                    newsArticleRepository.save(existing);
                    log.debug("Updated existing article: {}", existing.getTitle());
                } else {
                    // Save new article
                    newsArticleRepository.save(article);
                    savedCount++;
                    log.debug("Saved new article: {}", article.getTitle());
                }
                
            } catch (Exception e) {
                log.error("Failed to process article: {} - {}", article.getTitle(), e.getMessage(), e);
            }
        }
        
        log.info("Processed {} articles, saved {} new articles", articles.size(), savedCount);
        return savedCount;
    }

    @Override
    @Transactional
    public void updateSourceStatus(NewsSource source, boolean success, int articleCount) {
        
        if (success) {
            source.setLastSuccessAt(Instant.now());
            log.info("Source {} fetch successful. Articles: {}", source.getName(), articleCount);
        }
        
        newsSourceRepository.save(source);
    }

    @Override
    public boolean checkAllSourcesHealth() {
        List<NewsSource> sources = newsSourceRepository.findByIsActiveTrue();
        boolean allHealthy = true;
        
        for (NewsSource source : sources) {
            boolean isHealthy = checkSourceHealth(source);
            if (!isHealthy) {
                allHealthy = false;
                log.warn("Source {} is unhealthy", source.getName());
            }
        }
        
        return allHealthy;
    }

    private boolean checkSourceHealth(NewsSource source) {
        if (source.getLastSuccessAt() == null) {
            return true; // Never fetched before
        }

        // Check if last success was within 24 hours
        return source.getLastSuccessAt().isAfter(Instant.now().minusSeconds(24 * 60 * 60));
    }
}