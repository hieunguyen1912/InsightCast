package com.hieunguyen.podcastai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hieunguyen.podcastai.dto.request.FetchConfigurationRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.FetchConfigurationDto;
import com.hieunguyen.podcastai.service.FetchConfigurationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController("/api/v1/fetch-configurations")
@Slf4j
@RequiredArgsConstructor
public class FetchConfigurationController {
    
    private final FetchConfigurationService fetchConfigurationService;

    @PostMapping
    public ResponseEntity<ApiResponse<FetchConfigurationDto>> createFetchConfiguration(
        @Valid @RequestBody FetchConfigurationRequest request) {

        log.info("Creating fetch configuration with news source ID: {}", request.getNewsSourceId());
        FetchConfigurationDto fetchConfiguration = fetchConfigurationService.createFetchConfiguration(request);
        
        return ResponseEntity.ok(ApiResponse.success("Fetch configuration created successfully", fetchConfiguration));
    }
}
