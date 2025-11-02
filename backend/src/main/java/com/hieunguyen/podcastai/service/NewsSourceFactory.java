package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.entity.NewsSource;
import com.hieunguyen.podcastai.service.impl.*;
import com.hieunguyen.podcastai.validation.GNewsQueryValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsSourceFactory {
    
    private final RestTemplate restTemplate;
    private final GNewsQueryValidator gNewsQueryValidator;
    
    public NewsSourceIntegrationService createService(NewsSource source) {
        try {
            if (Boolean.FALSE.equals(source.getIsActive())) {
                log.warn("Source {} is inactive", source.getName());
                return null;
            }
            
            return createServiceByType(source);
            
        } catch (Exception e) {
            log.error("Failed to create service for source {}: {}", source.getName(), e.getMessage());
            throw new RuntimeException("Service creation failed", e);
        }
    }
    
    private NewsSourceIntegrationService createServiceByType(NewsSource source) {
        return switch (source.getType()) {
            case NEWS_API -> new NewsApiIntegrationService(restTemplate);
            case GNEWS_API -> new GNewsIntegrationService(restTemplate, gNewsQueryValidator);
            default -> throw new IllegalArgumentException("Unsupported source type: " + source.getType());
        };
    }
}