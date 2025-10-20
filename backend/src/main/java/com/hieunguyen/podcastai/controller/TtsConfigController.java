package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.TtsConfigRequest;
import com.hieunguyen.podcastai.dto.request.TtsConfigUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.TtsConfigDto;
import com.hieunguyen.podcastai.service.TtsConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/tts-configs")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class TtsConfigController {

    private final TtsConfigService ttsConfigService;

    /**
     * Create a new TTS configuration
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TtsConfigDto>> createTtsConfig(@Valid @RequestBody TtsConfigRequest request) {
        log.info("Creating TTS configuration with name: {}", request.getName());
        
        TtsConfigDto ttsConfig = ttsConfigService.createTtsConfig(request);
        
        ApiResponse<TtsConfigDto> response = ApiResponse.<TtsConfigDto>builder()
                .code(2000)
                .message("TTS configuration created successfully")
                .data(ttsConfig)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TtsConfigDto>> getTtsConfigById(@PathVariable Long id) {
        log.info("Retrieving TTS configuration with ID: {}", id);
        
        TtsConfigDto ttsConfig = ttsConfigService.getTtsConfigById(id);
        
        ApiResponse<TtsConfigDto> response = ApiResponse.<TtsConfigDto>builder()
                .code(2000)
                .message("TTS configuration retrieved successfully")
                .data(ttsConfig)
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update TTS configuration by ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TtsConfigDto>> updateTtsConfig(
            @PathVariable Long id, 
            @Valid @RequestBody TtsConfigUpdateRequest request) {
        log.info("Updating TTS configuration with ID: {}", id);
        
        TtsConfigDto ttsConfig = ttsConfigService.updateTtsConfig(id, request);
        
        ApiResponse<TtsConfigDto> response = ApiResponse.<TtsConfigDto>builder()
                .code(2000)
                .message("TTS configuration updated successfully")
                .data(ttsConfig)
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete TTS configuration by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTtsConfig(@PathVariable Long id) {
        log.info("Deleting TTS configuration with ID: {}", id);
        
        ttsConfigService.deleteTtsConfig(id);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(2000)
                .message("TTS configuration deleted successfully")
                .build();
        
        return ResponseEntity.ok(response);
    }

   
}
