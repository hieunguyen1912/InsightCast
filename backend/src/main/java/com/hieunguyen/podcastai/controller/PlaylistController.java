package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.PlaylistCreateRequest;
import com.hieunguyen.podcastai.dto.request.PlaylistUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.PlaylistDto;
import com.hieunguyen.podcastai.service.PlaylistService;

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
@RequestMapping("/api/v1/user/me/playlists")
@Slf4j
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<PlaylistDto>>> getUserPlaylists() {
        log.info("Getting user playlists");
        List<PlaylistDto> playlists = playlistService.getUserPlaylists();
        log.info("Successfully retrieved {} playlists", playlists.size());
        return ResponseEntity.ok(ApiResponse.success("Playlists retrieved successfully", playlists));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PlaylistDto>> getPlaylistById(@PathVariable Long id) {
        log.info("Getting playlist by ID: {}", id);
        PlaylistDto playlist = playlistService.getPlaylistById(id);
        log.info("Successfully retrieved playlist: {}", playlist.getName());
        return ResponseEntity.ok(ApiResponse.success("Playlist retrieved successfully", playlist));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PlaylistDto>> createPlaylist(@Valid @RequestBody PlaylistCreateRequest request) {
        log.info("Creating playlist: {}", request.getName());
        PlaylistDto playlist = playlistService.createPlaylist(request);
        log.info("Successfully created playlist: {}", playlist.getName());
        return ResponseEntity.ok(ApiResponse.success("Playlist created successfully", playlist));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PlaylistDto>> updatePlaylist(
            @PathVariable Long id, 
            @Valid @RequestBody PlaylistUpdateRequest request) {
        log.info("Updating playlist with ID: {}", id);
        PlaylistDto playlist = playlistService.updatePlaylist(id, request);
        log.info("Successfully updated playlist: {}", playlist.getName());
        return ResponseEntity.ok(ApiResponse.success("Playlist updated successfully", playlist));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deletePlaylist(@PathVariable Long id) {
        log.info("Deleting playlist with ID: {}", id);
        playlistService.deletePlaylist(id);
        log.info("Successfully deleted playlist");
        return ResponseEntity.ok(ApiResponse.success("Playlist deleted successfully", null));
    }
}
