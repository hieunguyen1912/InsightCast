package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.ImageResponseDto;

import com.hieunguyen.podcastai.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@RequiredArgsConstructor
public class UploadController {

    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageResponseDto>> uploadImage(
            @RequestParam("articleId") Long articleId,
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading image for article: {}, filename: {}, size: {} bytes", 
                articleId, file.getOriginalFilename(), file.getSize());
        
        ImageResponseDto image = imageService.uploadImage(articleId, file);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Image uploaded successfully", image));
    }

    /**
     * GET /api/v1/articles/{id}/images - Get all images for an article
     */
    @GetMapping("/articles/{id}/images")
    public ResponseEntity<ApiResponse<List<ImageResponseDto>>> getArticleImages(
            @PathVariable("id") Long articleId) {
        
        log.info("Getting images for article: {}", articleId);
        
        List<ImageResponseDto> images = imageService.getArticleImages(articleId);
        
        return ResponseEntity.ok(ApiResponse.success("Images retrieved successfully", images));
    }


    @DeleteMapping("/images/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        log.info("Deleting image: {}", id);
        
        imageService.deleteImage(id);
        
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }
}

