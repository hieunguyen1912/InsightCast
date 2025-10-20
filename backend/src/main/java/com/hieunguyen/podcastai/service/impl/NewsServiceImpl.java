package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.mapper.NewsArticleMapper;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.specification.SpecificationsBuilder;
import com.hieunguyen.podcastai.service.NewsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsServiceImpl implements NewsService {

    private final NewsArticleRepository newsArticleRepository;
    private final NewsArticleMapper newsArticleMapper;

    @Override
    public Page<NewsArticleResponse> searchNewsBySpecification(Pageable pageable, String... search) {
        log.info("Searching news articles with specification - search criteria: {}", (Object) search);
        
        SpecificationsBuilder<NewsArticle> builder = new SpecificationsBuilder<>();

        if (search.length > 0) {
            Pattern pattern = Pattern.compile("(\\w+(?:\\.\\w+)*)([<:>~!])(\\*?)([^*]*)(\\*?)");
            for (String s : search) {
                Matcher matcher = pattern.matcher(s);
                if (matcher.find()) {
                    String key = matcher.group(1);
                    String operation = matcher.group(2);
                    String prefix = matcher.group(3);
                    String value = matcher.group(4);
                    String suffix = matcher.group(5);

                    log.debug("Parsed search criteria - key: {}, operation: {}, value: {}, prefix: {}, suffix: {}", 
                            key, operation, value, prefix, suffix);

                    builder.with(key, operation, value, prefix, suffix);
                }
            }

            Page<NewsArticle> articles = newsArticleRepository.findAll(Objects.requireNonNull(builder.build()), pageable);
            log.info("Found {} news articles matching search criteria", articles.getTotalElements());
            
            // Convert to DTO
            return articles.map(newsArticleMapper::toDto);
        }
        
        log.info("No search criteria provided, returning all news articles");
        Page<NewsArticle> articles = newsArticleRepository.findAll(pageable);
        
        // Convert to DTO
        return articles.map(newsArticleMapper::toDto);
    }

    @Override
    public Optional<NewsArticleResponse> getNewsById(Long id) {
        log.info("Getting news article by ID: {}", id);
        return newsArticleRepository.findById(id)
            .map(newsArticleMapper::toDto);
    }

    @Override
    public List<NewsArticleSummaryResponse> getLatestNews(int limit) {
        log.info("Getting latest {} news articles", limit);
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<NewsArticle> page = newsArticleRepository.findAll(pageable);
        
        return newsArticleMapper.toSummaryDtoList(page.getContent());
    }

    @Override
    public List<NewsArticleSummaryResponse> getTrendingNews(int limit) {
        log.info("Getting trending {} news articles", limit);
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "viewCount"));
        Page<NewsArticle> page = newsArticleRepository.findAll(pageable);
        
        return newsArticleMapper.toSummaryDtoList(page.getContent());
    }

    @Override
    public Optional<NewsArticleSummaryResponse> getFeaturedArticle() {
        log.info("Getting featured article");
        
        // Featured article logic: Most viewed recent article (within last 7 days)
        // You can customize this logic based on your business requirements
        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "viewCount"));
        Page<NewsArticle> page = newsArticleRepository.findAll(pageable);
        
        if (page.hasContent()) {
            NewsArticle featuredArticle = page.getContent().get(0);
            log.info("Found featured article: {} with {} views", featuredArticle.getTitle(), featuredArticle.getViewCount());
            return Optional.of(newsArticleMapper.toSummaryDto(featuredArticle));
        }
        
        log.warn("No featured article found");
        return Optional.empty();
    }
    
}
