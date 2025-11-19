package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.GenerateSummaryRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.dto.response.AudioGenerationStatusDto;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.service.ArticleService;
import com.hieunguyen.podcastai.service.ArticleToAudioService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
@Slf4j
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleToAudioService articleToAudioService;

    @PostMapping("/generate-summary")
    public ResponseEntity<ApiResponse<String>> generateSummary(
            @Valid @RequestBody GenerateSummaryRequest request) {
        log.info("Previewing summary for content length: {}", 
                request.getMaxLength());
        
        String summary = articleService.generateSummary(request);
        
        return ResponseEntity.ok(ApiResponse.success("Summary generated successfully", summary));
    }

    // Endpoint for JSON (backward compatible)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<NewsArticleResponse>> createArticleJson(
            @Valid @RequestBody CreateArticleRequest request) {
        log.info("Creating new article with title: {} (JSON)", request.getTitle());

        NewsArticleResponse article = articleService.createArticle(request, null, null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Article created successfully", article));
    }

    // Endpoint for multipart/form-data (with file upload)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NewsArticleResponse>> createArticleMultipart(
            @RequestPart(value = "data") @Valid CreateArticleRequest request,
            @RequestPart(value = "featuredImage", required = false) MultipartFile featuredImage,
            @RequestPart(value = "contentImages", required = false) List<MultipartFile> contentImages) {
        log.info("Creating new article with title: {} (Multipart)", request.getTitle());

        NewsArticleResponse article = articleService.createArticle(request, featuredImage, contentImages);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Article created successfully", article));
    }

    @GetMapping("/my-drafts")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getMyDrafts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting draft articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleSummaryResponse> articles = articleService.getMyDrafts(pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);
        
        return ResponseEntity.ok(ApiResponse.success("Draft articles retrieved successfully", paginatedResponse));
    }

    @GetMapping("/my-submitted")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMySubmitted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting submitted articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMySubmitted(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Submitted articles retrieved successfully", articles));
    }

    @GetMapping("/my-approved")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyApproved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting approved articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyApproved(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Approved articles retrieved successfully", articles));
    }

    @GetMapping("/my-rejected")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyRejected(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting rejected articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyRejected(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Rejected articles retrieved successfully", articles));
    }

    @GetMapping("/my-all")
    public ResponseEntity<ApiResponse<Page<NewsArticleResponse>>> getMyAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Getting all my articles - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NewsArticleResponse> articles = articleService.getMyAllArticles(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("All articles retrieved successfully", articles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getArticleById(@PathVariable Long id) {
        log.info("Getting article with ID: {}", id);
        
        NewsArticleResponse article = articleService.getArticleById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article retrieved successfully", article));
    }

    // Endpoint for JSON (backward compatible)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateArticleJson(
            @PathVariable Long id,
            @Valid @RequestBody UpdateArticleRequest request) {
        log.info("Updating article with ID: {} (JSON)", id);
        
        NewsArticleResponse article = articleService.updateArticle(id, request, null);
        
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", article));
    }
    
    // Endpoint for multipart/form-data (with file upload)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateArticleMultipart(
            @PathVariable Long id,
            @RequestPart(value = "data") @Valid UpdateArticleRequest request,
            @RequestPart(value = "featuredImage", required = false) MultipartFile featuredImage) {
        log.info("Updating article with ID: {} (Multipart)", id);
        
        NewsArticleResponse article = articleService.updateArticle(id, request, featuredImage);
        
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", article));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        log.info("Deleting article with ID: {}", id);
        
        articleService.deleteArticle(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> submitForReview(@PathVariable Long id) {
        log.info("Submitting article with ID: {} for review", id);
        
        NewsArticleResponse article = articleService.submitForReview(id);
        
        return ResponseEntity.ok(ApiResponse.success("Article submitted for review successfully", article));
    }

    @GetMapping("/{id}/category")
    public ResponseEntity<ApiResponse<PaginatedResponse<NewsArticleSummaryResponse>>> getArticlesByCategory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Getting articles for category with ID: {}, page={}, size={}, sortBy={}, sortDirection={}",
                id, page, size, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<NewsArticleSummaryResponse> articles = articleService.getArticlesByCategory(id, pageable);
        PaginatedResponse<NewsArticleSummaryResponse> paginatedResponse = PaginationHelper.toPaginatedResponse(articles);

        return ResponseEntity.ok(ApiResponse.success("Articles retrieved successfully", paginatedResponse));
    }


    @PostMapping("/{articleId}/generate-audio")
    public ResponseEntity<ApiResponse<AudioFileDto>> generateAudioFromArticle(
            @PathVariable Long articleId,
            @RequestBody(required = false) @Valid AudioRequest request) {
        
        log.info("Generating audio for article: {}", articleId);
        
        if (request == null) {
            request = AudioRequest.builder().build();
        }
        
        AudioFileDto audioFile = articleToAudioService.generateAudioFromArticle(articleId, request);
    
        return ResponseEntity.accepted()
                .body(ApiResponse.success("Audio generation started. Use check-status endpoint to track progress.", audioFile));
    }

    @GetMapping("/audio/{audioFileId}/check-status")
    public ResponseEntity<ApiResponse<AudioGenerationStatusDto>> checkAudioGenerationStatus(
            @PathVariable Long audioFileId) {
        
        log.info("Checking audio generation status for audio file: {}", audioFileId);
        
        AudioGenerationStatusDto status = articleToAudioService.checkAndUpdateAudioGenerationStatus(audioFileId);
        
        return ResponseEntity.ok(ApiResponse.success("Audio generation status retrieved", status));
    }

    @GetMapping("/audio/{audioFileId}/stream")
    public ResponseEntity<InputStreamResource> streamAudio(
            @PathVariable Long audioFileId) {
        
        log.info("Streaming audio file: {}", audioFileId);
        
        try {
            java.io.InputStream audioStream = articleToAudioService.getAudioStream(audioFileId);
            AudioGenerationStatusDto audioFile = articleToAudioService.checkAndUpdateAudioGenerationStatus(audioFileId);
            
            InputStreamResource resource = new InputStreamResource(audioStream);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + audioFile.getAudioFileId() + "\"")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Failed to stream audio file {}: {}", audioFileId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("/audio/{audioFileId}")
    public ResponseEntity<ApiResponse<Void>> deleteAudioFile(@PathVariable Long audioFileId) {
        log.info("Deleting audio file: {}", audioFileId);
        
        articleToAudioService.deleteAudioFile(audioFileId);
        return ResponseEntity.ok(ApiResponse.success("Audio file deleted successfully", null));
    }

    @GetMapping("/audio/{audioFileId}/download")
    public ResponseEntity<byte[]> downloadAudio(
            @PathVariable Long audioFileId) {
        
        log.info("Downloading audio file: {}", audioFileId);
        
        try {
            byte[] audioBytes = articleToAudioService.getAudioBytes(audioFileId);
            AudioGenerationStatusDto audioFile = articleToAudioService.checkAndUpdateAudioGenerationStatus(audioFileId);
                        
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + audioFile.getAudioFileId() + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(audioBytes.length))
                    .body(audioBytes);
                    
        } catch (Exception e) {
            log.error("Failed to download audio file {}: {}", audioFileId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{articleId}/audio")
    public ResponseEntity<ApiResponse<List<AudioFileDto>>> getAudioByUserAndArticle(
            @PathVariable Long articleId
    ) {
        List<AudioFileDto> response = articleToAudioService.getAudioFiles(articleId);

        return ResponseEntity.ok(ApiResponse.success("Audio files retrieved successfully", response));
    }

    @PostMapping("/{id}/generate-audio-from-summary")
    public ResponseEntity<ApiResponse<AudioFileDto>> generateAudioFromSummary(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid AudioRequest request) {
        
        log.info("Generating audio from summary for article: {}", id);
        
        if (request == null) {
            request = AudioRequest.builder().build();
        }
        
        AudioFileDto audioFile = articleToAudioService.generateAudioFromSummary(id, request);
    
        return ResponseEntity.accepted()
                .body(ApiResponse.success("Audio generation from summary started. Use check-status endpoint to track progress.", audioFile));
    }
}

