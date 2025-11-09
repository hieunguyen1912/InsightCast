package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.response.ImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {
    
    /**
     * Upload image for an article
     * @param articleId Article ID
     * @param file MultipartFile image
     * @return ImageResponseDto
     */
    ImageResponseDto uploadImage(Long articleId, MultipartFile file);
    
    /**
     * Get all images for an article
     * @param articleId Article ID
     * @return List of ImageResponseDto
     */
    List<ImageResponseDto> getArticleImages(Long articleId);
    
    /**
     * Delete an image
     * @param imageId Image ID
     */
    void deleteImage(Long imageId);
    
    /**
     * Upload featured image for a news article
     * @param newsArticleId News Article ID
     * @param file MultipartFile image
     * @return ImageResponseDto with the uploaded image URL
     */
    ImageResponseDto uploadFeaturedImage(Long newsArticleId, MultipartFile file);
}

