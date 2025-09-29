package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.UserFavoriteRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.service.UserFavoriteService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/me/favorites")
@Slf4j
@RequiredArgsConstructor
public class UserFavoriteController {

    private final UserFavoriteService userFavoriteService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<UserFavoriteDto>>> getUserFavorites() {
        log.info("Getting user favorites");
        List<UserFavoriteDto> favorites = userFavoriteService.getUserFavorites();
        log.info("Successfully retrieved {} favorites", favorites.size());
        return ResponseEntity.ok(ApiResponse.success("Favorites retrieved successfully", favorites));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<UserFavoriteDto>> addFavorite(@Valid @RequestBody UserFavoriteRequest request) {
        log.info("Adding favorite");
        UserFavoriteDto favorite = userFavoriteService.addFavorite(request);
        log.info("Successfully added favorite");
        return ResponseEntity.ok(ApiResponse.success("Favorite added successfully", favorite));
    }

    @DeleteMapping("/{favoriteId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long favoriteId) {
        log.info("Removing favorite with ID: {}", favoriteId);
        userFavoriteService.removeFavorite(favoriteId);
        log.info("Successfully removed favorite");
        return ResponseEntity.ok(ApiResponse.success("Favorite removed successfully", null));
    }

    @DeleteMapping("/by-item")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteByItem(
            @RequestParam Long itemId, 
            @RequestParam com.hieunguyen.podcastai.enums.FavoriteType type) {
        log.info("Removing favorite by item ID: {} and type: {}", itemId, type);
        userFavoriteService.removeFavoriteByItem(itemId, type);
        log.info("Successfully removed favorite by item");
        return ResponseEntity.ok(ApiResponse.success("Favorite removed successfully", null));
    }
}
