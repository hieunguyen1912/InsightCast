package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.ImageResponseDto;
import com.hieunguyen.podcastai.entity.ArticleImage;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.ArticleImageRepository;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.service.ImageService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ImageServiceImpl implements ImageService {

    private final ArticleImageRepository imageRepository;
    private final NewsArticleRepository articleRepository;
    private final SecurityUtils securityUtils;

    @Value("${app.image.storage.path:./uploads/images}")
    private String imageStoragePath;

    @Value("${app.image.max-size:10485760}") // 10MB default
    private long maxFileSize;

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    @Override
    public ImageResponseDto uploadImage(Long articleId, MultipartFile file) {
        // Verify article exists and user is the author
        NewsArticle article = articleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        var currentUser = securityUtils.getCurrentUser();
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Validate file
        validateImageFile(file);

        try {
            // Create upload directory if not exists
            Path uploadDir = Paths.get(imageStoragePath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

            // Create subdirectory by article ID
            Path articleDir = uploadDir.resolve(String.valueOf(articleId));
            if (!Files.exists(articleDir)) {
                Files.createDirectories(articleDir);
            }

            // Save file
            Path filePath = articleDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL (relative path or full URL)
            String url = "/api/v1/images/" + articleId + "/" + uniqueFilename;

            // Save to database
            ArticleImage articleImage = ArticleImage.builder()
                    .url(url)
                    .fileName(originalFilename)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .article(article)
                    .build();

            ArticleImage savedImage = imageRepository.save(articleImage);
            log.info("Image uploaded successfully: {} for article: {}", savedImage.getId(), articleId);

            return mapToDto(savedImage);

        } catch (IOException e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImageResponseDto> getArticleImages(Long articleId) {
        log.info("Getting images for article: {}", articleId);

        // Verify article exists
        if (!articleRepository.existsById(articleId)) {
            throw new AppException(ErrorCode.ARTICLE_NOT_FOUND);
        }

        List<ArticleImage> images = imageRepository.findByArticleIdOrderByCreatedAtDesc(articleId);

        return images.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteImage(Long imageId) {
        log.info("Deleting image: {}", imageId);

        ArticleImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND));

        // Verify user is the article author
        var currentUser = securityUtils.getCurrentUser();
        if (!image.getArticle().getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        try {
            // Delete file from storage
            String url = image.getUrl();
            if (url != null && url.startsWith("/api/v1/images/")) {
                // Extract path from URL
                String[] parts = url.split("/");
                if (parts.length >= 4) {
                    String articleId = parts[parts.length - 2];
                    String filename = parts[parts.length - 1];
                    Path filePath = Paths.get(imageStoragePath, articleId, filename);
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                        log.info("Deleted image file: {}", filePath);
                    }
                }
            }

            // Delete from database
            imageRepository.delete(image);
            log.info("Image deleted successfully: {}", imageId);

        } catch (IOException e) {
            log.error("Error deleting image file: {}", e.getMessage(), e);
            // Still delete from database even if file deletion fails
            imageRepository.delete(image);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "jpg"; // default extension
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private ImageResponseDto mapToDto(ArticleImage image) {
        return ImageResponseDto.builder()
                .id(image.getId())
                .url(image.getUrl())
                .fileName(image.getFileName())
                .fileSize(image.getFileSize())
                .contentType(image.getContentType())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
}

