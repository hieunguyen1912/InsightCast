package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.GNewsResponse;
import com.hieunguyen.podcastai.entity.FetchConfiguration;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.NewsSource;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.enums.FetchType;
import com.hieunguyen.podcastai.enums.NewsSourceType;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.service.NewsSourceIntegrationService;
import com.hieunguyen.podcastai.validation.GNewsQueryValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpStatusCodeException;

@Service
@RequiredArgsConstructor
@Slf4j
public class GNewsIntegrationService implements NewsSourceIntegrationService {
    
    private final RestTemplate restTemplate;
    private final GNewsQueryValidator queryValidator;
    private static final String SEARCH_ENDPOINT = "/search";
    private static final String TOP_HEADLINES_ENDPOINT = "/top-headlines";
    
    @Override
    @Retryable(value = {RestClientException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public List<NewsArticle> fetchNews(NewsSource source) {
        log.info("Fetching news from {}", source.getName());
        List<NewsArticle> allArticles = new ArrayList<>();

        for (FetchConfiguration fetchConfiguration : source.getFetchConfigurations()) {
            if (fetchConfiguration.getEnabled()) {
                if (fetchConfiguration.getFetchType().equals(FetchType.SEARCH)) {

                    GNewsResponse gNewsResponse = fetchSearchArticles(source, fetchConfiguration);

                    if (gNewsResponse != null) {
                        List<NewsArticle> searchArticles = convertToArticles(gNewsResponse, fetchConfiguration);
                        allArticles.addAll(searchArticles);
                    }

                } else {

                    GNewsResponse gNewsResponse = fetchTopHeadlines(source, fetchConfiguration);

                    if (gNewsResponse != null) {
                        List<NewsArticle> topHeadlinesArticles = convertToArticles(gNewsResponse, fetchConfiguration);
                        allArticles.addAll(topHeadlinesArticles);
                    }
                }
            }


        }
        return allArticles;
    }

    /**
     * Fetch raw GNewsResponse for testing/debugging purposes
     * Returns the first enabled fetch configuration's response
     */
    public GNewsResponse fetchRawResponse(NewsSource source) {
        log.info("Fetching raw GNews response from {}", source.getName());
        
        if (source.getFetchConfigurations() == null || source.getFetchConfigurations().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEARCH_INPUT);
        }

        // Get first enabled fetch configuration
        FetchConfiguration fetchConfiguration = source.getFetchConfigurations().stream()
                .filter(FetchConfiguration::getEnabled)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_SEARCH_INPUT));

        if (fetchConfiguration.getFetchType().equals(FetchType.SEARCH)) {
            return fetchSearchArticles(source, fetchConfiguration);
        } else {
            return fetchTopHeadlines(source, fetchConfiguration);
        }
    }

    private GNewsResponse fetchSearchArticles(NewsSource source, FetchConfiguration fetchConfiguration) {
        // Validate required parameters for search
        if (fetchConfiguration.getKeywords() == null || fetchConfiguration.getKeywords().trim().isEmpty()) {
            log.error("GNews search requires 'q' parameter (keywords)");
            throw new AppException(ErrorCode.INVALID_SEARCH_INPUT);
        }
        
        // Validate and sanitize query syntax
        String validatedQuery;
        try {
            validatedQuery = queryValidator.validateAndSanitize(fetchConfiguration.getKeywords());
            log.debug("Validated GNews query: '{}' -> '{}'", fetchConfiguration.getKeywords(), validatedQuery);
        } catch (AppException e) {
            log.error("GNews query validation failed: {}", fetchConfiguration.getKeywords());
            throw e;
        }
        
        URI request = null;
        try {
            request = buildSearchUri(source, fetchConfiguration, validatedQuery);
            ResponseEntity<GNewsResponse> response = restTemplate.exchange(request, HttpMethod.GET, null, GNewsResponse.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("GNews API không trả về dữ liệu hợp lệ. Code: {}, uri: {}", response.getStatusCode(), request);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            
            GNewsResponse gNewsResponse = response.getBody();
            // Log warning if article list is null
            if (gNewsResponse.getArticles() == null) {
                log.warn("GNews API returned null article list. Total articles: {}, URI: {}", 
                        gNewsResponse.getTotalArticles(), request);
            } else {
                log.debug("GNews API returned {} articles", gNewsResponse.getArticles().size());
            }
            
            return gNewsResponse;
        } catch (HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            int status = httpEx.getStatusCode().value();
            log.error("GNews API error - Status: {}, Response: {}, URI: {}", status, errorBody, request);
            ErrorCode errorCode;
            switch (status) {
                case 400:
                    errorCode = ErrorCode.INVALID_SEARCH_INPUT;
                    break;
                case 401:
                case 403:
                    errorCode = ErrorCode.UNAUTHORIZED;
                    break;
                case 429:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
                    break;
                case 500:
                case 503:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
                    break;
                default:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
            }
            throw new AppException(errorCode);
        } catch (RestClientException e) {
            log.error("Không thể kết nối GNews API: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private URI buildSearchUri(NewsSource source, FetchConfiguration fetchConfiguration, String validatedQuery) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(source.getApiBaseUrl() + SEARCH_ENDPOINT);

        // API key is required
        if (source.getApiKey() != null && !source.getApiKey().isEmpty()) {
            builder.queryParam("apikey", source.getApiKey());
        }

        // Query parameter is required for search (use validated query)
        builder.queryParam("q", validatedQuery);

        if (fetchConfiguration.getLanguages() != null && !fetchConfiguration.getLanguages().isEmpty()) {
            builder.queryParam("lang", fetchConfiguration.getLanguages());
        }

        if (fetchConfiguration.getCountries() != null && !fetchConfiguration.getCountries().isEmpty()) {
            builder.queryParam("country", fetchConfiguration.getCountries());
        }

        if (fetchConfiguration.getMaxResults() != null) {
            builder.queryParam("max", fetchConfiguration.getMaxResults());
        }

        if (fetchConfiguration.getSortBy() != null && !fetchConfiguration.getSortBy().isEmpty()) {
            builder.queryParam("sortby", fetchConfiguration.getSortBy());
        }

        // Format date as YYYYMMDD
        if (fetchConfiguration.getFrom() != null) {
            builder.queryParam("from", formatDate(fetchConfiguration.getFrom()));
        }

        if (fetchConfiguration.getTo() != null) {
            builder.queryParam("to", formatDate(fetchConfiguration.getTo()));
        }

        URI uri = builder.build().toUri();
        log.debug("GNews Search URI: {}", uri);
        return uri;
    }

    private String formatDate(Instant instant) {
        if (instant == null) {
            return null;
        }
        LocalDate date = instant.atZone(ZoneId.systemDefault()).toLocalDate();
        return date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    private GNewsResponse fetchTopHeadlines(NewsSource source, FetchConfiguration fetchConfiguration) {
        URI request = null;
        try {
            request = buildTopHeadlinesUri(source, fetchConfiguration);
            ResponseEntity<GNewsResponse> response = restTemplate.exchange(request, HttpMethod.GET, null, GNewsResponse.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("GNews API không trả về tin top-headlines hợp lệ. Code: {}, uri: {}", response.getStatusCode(), request);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            
            GNewsResponse gNewsResponse = response.getBody();
            if (gNewsResponse.getArticles() == null) {
                log.warn("GNews API returned null article list. Total articles: {}, URI: {}", 
                        gNewsResponse.getTotalArticles(), request);
            } else {
                log.debug("GNews API returned {} articles", gNewsResponse.getArticles().size());
            }
            
            return gNewsResponse;
        } catch (HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            int status = httpEx.getStatusCode().value();
            log.error("GNews API error - Status: {}, Response: {}, URI: {}", status, errorBody, request);
            ErrorCode errorCode;
            switch (status) {
                case 400:
                    errorCode = ErrorCode.INVALID_SEARCH_INPUT;
                    break;
                case 401:
                case 403:
                    errorCode = ErrorCode.UNAUTHORIZED;
                    break;
                case 429:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
                    break;
                case 500:
                case 503:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
                    break;
                default:
                    errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
            }
            throw new AppException(errorCode);
        } catch (RestClientException e) {
            log.error("Không thể kết nối GNews API (top-headlines): {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private URI buildTopHeadlinesUri(NewsSource source, FetchConfiguration fetchConfiguration) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(source.getApiBaseUrl() + TOP_HEADLINES_ENDPOINT);

        // API key is required
        if (source.getApiKey() != null && !source.getApiKey().isEmpty()) {
            builder.queryParam("apikey", source.getApiKey());
        }

        if (fetchConfiguration.getKeywords() != null && !fetchConfiguration.getKeywords().isEmpty()) {
            builder.queryParam("q", fetchConfiguration.getKeywords());
        }

        if (fetchConfiguration.getLanguages() != null && !fetchConfiguration.getLanguages().isEmpty()) {
            builder.queryParam("lang", fetchConfiguration.getLanguages());
        }

        if (fetchConfiguration.getCategory() != null && fetchConfiguration.getCategory().getName() != null) {
            builder.queryParam("categories", fetchConfiguration.getCategory().getName());
        }

        if (fetchConfiguration.getCountries() != null && !fetchConfiguration.getCountries().isEmpty()) {
            builder.queryParam("country", fetchConfiguration.getCountries());
        }

        if (fetchConfiguration.getMaxResults() != null) {
            builder.queryParam("max", fetchConfiguration.getMaxResults());
        }

        // Format date as YYYYMMDD
        if (fetchConfiguration.getFrom() != null) {
            builder.queryParam("from", formatDate(fetchConfiguration.getFrom()));
        }

        if (fetchConfiguration.getTo() != null) {
            builder.queryParam("to", formatDate(fetchConfiguration.getTo()));
        }

        URI uri = builder.build().toUri();
        log.debug("GNews Top Headlines URI: {}", uri);
        return uri;
    }


    private List<NewsArticle> convertToArticles(GNewsResponse gNewsResponse, FetchConfiguration fetchConfiguration) {
        if (gNewsResponse == null) {
            log.warn("GNewsResponse is null");
            return new ArrayList<>();
        }

        if (gNewsResponse.getArticles() == null || gNewsResponse.getArticles().isEmpty()) {
            log.warn("GNewsResponse has no articles. Total articles: {}", gNewsResponse.getTotalArticles());
            return new ArrayList<>();
        }

        return gNewsResponse.getArticles().stream()
            .filter(article -> article != null) // Filter out null articles
            .map(article -> {
                try {
                    NewsArticle.NewsArticleBuilder builder = NewsArticle.builder()
                        .title(article.getTitle())
                        .description(article.getDescription())
                        .content(article.getContent())
                        .url(article.getUrl())
                        .imageUrl(article.getImage())
                        .category(fetchConfiguration.getCategory())
                        .sources(fetchConfiguration.getNewsSource());

                    // Handle source name (can be null)
                    if (article.getSource() != null && article.getSource().getName() != null) {
                        builder.sourceName(article.getSource().getName());
                    }

                    // Handle publishedAt (can be null or invalid format)
                    if (article.getPublishedAt() != null && !article.getPublishedAt().isEmpty()) {
                        try {
                            builder.publishedAt(Instant.parse(article.getPublishedAt()));
                        } catch (Exception e) {
                            log.warn("Failed to parse publishedAt: {}", article.getPublishedAt(), e);
                            // Set to current time if parsing fails
                            builder.publishedAt(Instant.now());
                        }
                    } else {
                        // Set to current time if null
                        builder.publishedAt(Instant.now());
                    }

                    return builder.build();
                } catch (Exception e) {
                    log.error("Error converting article to NewsArticle: {}", article, e);
                    return null; // Return null to filter out later
                }
            })
            .filter(article -> article != null) // Filter out failed conversions
            .collect(Collectors.toList());
    }

    @Override
    public boolean isHealthy() {
        return true;
    }
    
    @Override
    public String getSourceType() {
        return NewsSourceType.GNEWS_API.name();
    }
}