package com.hieunguyen.podcastai.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.service.AudioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/audio")
@Slf4j
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<AudioFileDto>> createAudio(@Valid @RequestBody AudioRequest request) {
        log.info("Creating audio with title: {}", request.getTitle());
        
        try {
            AudioFileDto audioFile = audioService.createAudio(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Audio created successfully", audioFile));
        } catch (Exception e) {
            log.error("Failed to create audio: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create audio: " + e.getMessage()));
        }
    }
    
    /**
     * Stream audio file for playback
     */
    @GetMapping("/{id}/stream")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> streamAudio(@PathVariable Long id) {
        log.info("Streaming audio file with ID: {}", id);
        
        try {
            AudioFile audioFile = audioService.getAudioFileById(id);
            byte[] audioBytes = audioService.getAudioFileBytes(audioFile);
            
            String contentType = getContentTypeFromFileName(audioFile.getFileName());
            
            log.info("Streaming audio file: {} ({} bytes)", audioFile.getFileName(), audioBytes.length);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + audioFile.getFileName() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(audioBytes);
                    
        } catch (Exception e) {
            log.error("Failed to stream audio file with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Download audio file
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> downloadAudio(@PathVariable Long id) {
        log.info("Downloading audio file with ID: {}", id);
        
        try {
            AudioFile audioFile = audioService.getAudioFileById(id);
            byte[] audioBytes = audioService.getAudioFileBytes(audioFile);
            
            String contentType = getContentTypeFromFileName(audioFile.getFileName());
            
            log.info("Downloading audio file: {} ({} bytes)", audioFile.getFileName(), audioBytes.length);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + audioFile.getFileName() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(audioBytes);
                    
        } catch (Exception e) {
            log.error("Failed to download audio file with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get audio file metadata
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<AudioFileDto>> getAudioFile(@PathVariable Long id) {
        log.info("Getting audio file metadata for ID: {}", id);
        
        try {
            AudioFileDto audioFile = audioService.getAudioFileDtoById(id);
            return ResponseEntity.ok(ApiResponse.success("Audio file retrieved successfully", audioFile));
        } catch (Exception e) {
            log.error("Failed to get audio file with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to get audio file: " + e.getMessage()));
        }
    }
    
    /**
     * Get user's audio files
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<AudioFileDto>>> getUserAudioFiles() {
        log.info("Getting user's audio files");
        
        try {
            List<AudioFileDto> audioFiles = audioService.getUserAudioFiles();
            return ResponseEntity.ok(ApiResponse.success("User audio files retrieved successfully", audioFiles));
        } catch (Exception e) {
            log.error("Failed to get user's audio files: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to get user's audio files: " + e.getMessage()));
        }
    }
    
    /**
     * Delete audio file
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<String>> deleteAudio(@PathVariable Long id) {
        log.info("Deleting audio file with ID: {}", id);
        
        try {
            boolean deleted = audioService.deleteAudioFile(id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Audio file deleted successfully", "Audio file with ID " + id + " has been deleted"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete audio file"));
            }
        } catch (Exception e) {
            log.error("Failed to delete audio file with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete audio file: " + e.getMessage()));
        }
    }
    
    /**
     * Test audio streaming endpoint
     */
    @GetMapping("/test-stream/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<String>> testStreamAudio(@PathVariable Long id) {
        log.info("Testing audio stream for ID: {}", id);
        
        try {
            AudioFile audioFile = audioService.getAudioFileById(id);
            String result = "Audio file found: " + audioFile.getTitle() + 
                " - File: " + audioFile.getFileName() + 
                " - Size: " + audioFile.getFileSizeBytes() + " bytes";
            return ResponseEntity.ok(ApiResponse.success("Audio file test successful", result));
        } catch (Exception e) {
            log.error("Test audio stream failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }
    
    /**
     * Determine content type from file name
     */
    private String getContentTypeFromFileName(String fileName) {
        if (fileName == null) {
            return "audio/mpeg";
        }
        
        String extension = fileName.toLowerCase();
        if (extension.endsWith(".mp3")) {
            return "audio/mpeg";
        } else if (extension.endsWith(".wav")) {
            return "audio/wav";
        } else if (extension.endsWith(".ogg")) {
            return "audio/ogg";
        } else if (extension.endsWith(".flac")) {
            return "audio/flac";
        } else {
            return "audio/mpeg"; // Default
        }
    }
}