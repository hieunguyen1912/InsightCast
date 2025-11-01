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
    private static final String SEARCH_ENDPOINT = "/search";
    private static final String TOP_HEADLINES_ENDPOINT = "/top-headlines";
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    
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
        return null;
    }

    private GNewsResponse fetchSearchArticles(NewsSource source, FetchConfiguration fetchConfiguration) {
        try {
            URI request = buildSearchUri(source, fetchConfiguration);
            ResponseEntity<GNewsResponse> response = restTemplate.exchange(request, HttpMethod.GET, null, GNewsResponse.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("GNews API không trả về dữ liệu hợp lệ. Code: {}, uri: {}", response.getStatusCode(), request);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            return response.getBody();
        } catch (HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            int status = httpEx.getStatusCode().value();
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

    private URI buildSearchUri(NewsSource source, FetchConfiguration fetchConfiguration) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(source.getApiBaseUrl() + SEARCH_ENDPOINT);

        builder.queryParam("q", fetchConfiguration.getKeywords());
        builder.queryParam("lang", fetchConfiguration.getLanguages());
        builder.queryParam("country", fetchConfiguration.getCountries());
        builder.queryParam("max", fetchConfiguration.getMaxResults());
        builder.queryParam("sortby", fetchConfiguration.getSortBy());
        builder.queryParam("from", fetchConfiguration.getFrom());
        builder.queryParam("to", fetchConfiguration.getTo());

        return builder.build().toUri();
    }

    private GNewsResponse fetchTopHeadlines(NewsSource source, FetchConfiguration fetchConfiguration) {
        try {
            URI request = buildTopHeadlinesUri(source, fetchConfiguration);
            ResponseEntity<GNewsResponse> response = restTemplate.exchange(request, HttpMethod.GET, null, GNewsResponse.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("GNews API không trả về tin top-headlines hợp lệ. Code: {}, uri: {}", response.getStatusCode(), request);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            return response.getBody();
        } catch (HttpStatusCodeException httpEx) {
            String errorBody = httpEx.getResponseBodyAsString();
            int status = httpEx.getStatusCode().value();
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
        builder.queryParam("q", fetchConfiguration.getKeywords());
        builder.queryParam("lang", fetchConfiguration.getLanguages());
        builder.queryParam("categories", fetchConfiguration.getCategory().getName());
        builder.queryParam("country", fetchConfiguration.getCountries());
        builder.queryParam("max", fetchConfiguration.getMaxResults());
        builder.queryParam("from", fetchConfiguration.getFrom());
        builder.queryParam("to", fetchConfiguration.getTo());
        return builder.build().toUri();
    }


    private List<NewsArticle> convertToArticles(GNewsResponse gNewsResponse, FetchConfiguration fetchConfiguration) {
        return gNewsResponse.getArticle().stream()
            .map(article -> NewsArticle.builder()
                .title(article.getTitle())
                .description(article.getDescription())
                .content(article.getContent())
                .url(article.getUrl())
                .sourceName(article.getSource().getName())
                .publishedAt(Instant.parse(article.getPublishedAt()))
                .imageUrl(article.getImage())
                .category(fetchConfiguration.getCategory())
                .sources(fetchConfiguration.getNewsSource())
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public boolean isHealthy() {
        return true;
    }
    
    @Override
    public String getSourceType() {
        return NewsSourceType.NEWS_API.name();
    }
}