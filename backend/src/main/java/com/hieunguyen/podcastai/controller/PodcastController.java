package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.PodcastCreateRequest;
import com.hieunguyen.podcastai.dto.request.PodcastUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.PodcastDto;
import com.hieunguyen.podcastai.service.PodcastService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/me/podcasts")
@Slf4j
@RequiredArgsConstructor
public class PodcastController {

    private final PodcastService podcastService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<PodcastDto>>> getUserPodcasts() {
        log.info("Getting user podcasts");
        List<PodcastDto> podcasts = podcastService.getUserPodcasts();
        log.info("Successfully retrieved {} podcasts", podcasts.size());
        return ResponseEntity.ok(ApiResponse.success("Podcasts retrieved successfully", podcasts));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PodcastDto>> getPodcastById(@PathVariable Long id) {
        log.info("Getting podcast by ID: {}", id);
        PodcastDto podcast = podcastService.getPodcastById(id);
        log.info("Successfully retrieved podcast: {}", podcast.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Podcast retrieved successfully", podcast));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PodcastDto>> createPodcast(@Valid @RequestBody PodcastCreateRequest request) {
        log.info("Creating podcast: {}", request.getTitle());
        PodcastDto podcast = podcastService.createPodcast(request);
        log.info("Successfully created podcast: {}", podcast.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Podcast created successfully", podcast));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PodcastDto>> updatePodcast(
            @PathVariable Long id, 
            @Valid @RequestBody PodcastUpdateRequest request) {
        log.info("Updating podcast with ID: {}", id);
        PodcastDto podcast = podcastService.updatePodcast(id, request);
        log.info("Successfully updated podcast: {}", podcast.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Podcast updated successfully", podcast));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deletePodcast(@PathVariable Long id) {
        log.info("Deleting podcast with ID: {}", id);
        podcastService.deletePodcast(id);
        log.info("Successfully deleted podcast");
        return ResponseEntity.ok(ApiResponse.success("Podcast deleted successfully", null));
    }
}
