package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.dto.response.UserFavoriteDto;
import com.hieunguyen.podcastai.service.UserFavoriteService;


import com.hieunguyen.podcastai.util.PaginationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/user/me/favorites")
@Slf4j
@RequiredArgsConstructor
public class UserFavoriteController {

    private final UserFavoriteService userFavoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<UserFavoriteDto>>> getUserFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserFavoriteDto> favorites = userFavoriteService.getUserFavorites(pageable);
        PaginatedResponse<UserFavoriteDto> response = PaginationHelper.toPaginatedResponse(favorites);

        return ResponseEntity.ok(ApiResponse.success("Favorites retrieved successfully", response));
    }

    @PostMapping("/{articleId}")
    public ResponseEntity<ApiResponse<UserFavoriteDto>> addFavorite(@PathVariable Long articleId) {
        UserFavoriteDto favorite = userFavoriteService.addFavorite(articleId);
        return ResponseEntity.ok(ApiResponse.success("Favorite added successfully", favorite));
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long favoriteId) {
        userFavoriteService.removeFavorite(favoriteId);
        return ResponseEntity.ok(ApiResponse.success("Favorite removed successfully", null));
    }
}
