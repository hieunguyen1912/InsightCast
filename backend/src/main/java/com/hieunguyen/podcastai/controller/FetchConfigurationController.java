package com.hieunguyen.podcastai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hieunguyen.podcastai.dto.request.FetchConfigurationRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.FetchConfigurationDto;
import com.hieunguyen.podcastai.service.FetchConfigurationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fetch-configurations")
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<FetchConfigurationDto>>> getAllFetchConfigurations() {

        List<FetchConfigurationDto> fetchConfigurationDto = fetchConfigurationService.getAllFetchConfigurations();

        return ResponseEntity.ok(ApiResponse.success("fetch configurations", fetchConfigurationDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FetchConfigurationDto>> updateFetchConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody FetchConfigurationRequest request) {
        FetchConfigurationDto response = fetchConfigurationService.updateFetchConfiguration(id, request);

        return ResponseEntity.ok(ApiResponse.success("Fetch configuration updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFetchConfiguration(@PathVariable Long id) {
        fetchConfigurationService.deleteFetchConfiguration(id);
        return ResponseEntity.ok(ApiResponse.success("delete fetch config successful", null));
    }
}
