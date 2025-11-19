package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import com.hieunguyen.podcastai.mapper.NewsArticleMapper;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.service.NewsArticleService;
import com.hieunguyen.podcastai.specification.SpecificationsBuilder;

import com.hieunguyen.podcastai.validator.SearchValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class NewsArticleServiceImpl implements NewsArticleService {

    private final NewsArticleRepository newsArticleRepository;
    private final NewsArticleMapper newsArticleMapper;
    private final SearchValidator validator;

    @Override
    public Page<NewsArticleResponse> searchFullText(
            String keyword,
            Long categoryId,
            Instant fromDate,
            Instant toDate,
            Pageable pageable) {
        log.info("=== FULL-TEXT SEARCH START ===");
        log.info("keyword: {}, categoryId: {}, fromDate: {}, toDate: {}",
                keyword, categoryId, fromDate, toDate);

        String sanitized = (keyword != null && !keyword.isBlank())
                ? validator.sanitizeKeyword(keyword)
                : null;

        Page<NewsArticle> articles = newsArticleRepository.fullTextSearch(sanitized, categoryId, fromDate, toDate, pageable);

        return articles.map(newsArticleMapper::toDto);
    }

    @Override
    public Page<NewsArticleSummaryResponse> findByCategoryId(Long categoryId, Pageable pageable) {
        Page<NewsArticle> newsArticles = newsArticleRepository.findByCategoryIdAndStatus(categoryId, ArticleStatus.APPROVED, pageable);
        return newsArticles.map(newsArticleMapper::toSummaryDto);
    }

    @Override
    @Transactional
    public Optional<NewsArticleResponse> getNewsById(Long id) {
        log.info("Getting news article by ID: {}", id);
        Optional<NewsArticle> articleOpt = newsArticleRepository.findByIdAndStatus(id, ArticleStatus.APPROVED);
        
        if (articleOpt.isPresent()) {
            NewsArticle article = articleOpt.get();
            // Increment view count
            article.setViewCount(article.getViewCount() + 1);
            newsArticleRepository.save(article);
            log.info("Incremented view count for article ID: {}, new count: {}", id, article.getViewCount());
            return Optional.of(newsArticleMapper.toDto(article));
        }
        
        return Optional.empty();
    }

    @Override
    public List<NewsArticleSummaryResponse> getLatestNews(int limit) {
        log.info("Getting latest {} news articles", limit);
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<NewsArticle> page = newsArticleRepository.findByStatus(ArticleStatus.APPROVED, pageable);
        
        return newsArticleMapper.toSummaryDtoList(page.getContent());
    }

    @Override
    public List<NewsArticleSummaryResponse> getTrendingNews(int limit) {
        log.info("Getting trending {} news articles", limit);
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "viewCount"));
        Page<NewsArticle> page = newsArticleRepository.findByStatus(ArticleStatus.APPROVED, pageable);
        
        return newsArticleMapper.toSummaryDtoList(page.getContent());
    }

    @Override
    public Optional<NewsArticleSummaryResponse> getFeaturedArticle() {
        log.info("Getting featured article");

        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "viewCount"));
        Page<NewsArticle> page = newsArticleRepository.findByStatus(ArticleStatus.APPROVED, pageable);
        
        if (page.hasContent()) {
            NewsArticle featuredArticle = page.getContent().get(0);
            log.info("Found featured article: {} with {} views", featuredArticle.getTitle(), featuredArticle.getViewCount());
            return Optional.of(newsArticleMapper.toSummaryDto(featuredArticle));
        }
        
        log.warn("No featured article found");
        return Optional.empty();
    }
    
}
