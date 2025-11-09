package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.RejectArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.entity.Category;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.NewsArticleMapper;
import com.hieunguyen.podcastai.repository.CategoryRepository;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.service.ArticleService;
import com.hieunguyen.podcastai.service.ImageService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import com.hieunguyen.podcastai.util.SlugHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements ArticleService {

    private final NewsArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final NewsArticleMapper articleMapper;
    private final SecurityUtils securityUtils;
    private final ImageService imageService;

    @Override
    public NewsArticleResponse createArticle(CreateArticleRequest request, MultipartFile featuredImage) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Creating article with title: {} by user: {}", request.getTitle(), currentUser.getEmail());
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        // Generate slug
        String slug = SlugHelper.generateSlug(request.getTitle());
        String originalSlug = slug;
        int counter = 1;
        while (articleRepository.existsBySlug(slug)) {
            slug = originalSlug + "-" + counter;
            counter++;
        }
        
        // Extract plain text from HTML content
        String plainText = Jsoup.parse(request.getContent()).text();
        
        // Create article first to get ID
        NewsArticle article = NewsArticle.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .content(request.getContent())
                .plainText(plainText)
                .slug(slug)
                .featuredImage(request.getFeaturedImage()) // Will be updated if file uploaded
                .author(currentUser)
                .category(category)
                .status(ArticleStatus.DRAFT)
                .viewCount(0L)
                .likeCount(0L)
                .shareCount(0L)
                .build();
        
        NewsArticle savedArticle = articleRepository.save(article);
        
        if (featuredImage != null && !featuredImage.isEmpty()) {
            try {
                var imageResponse = imageService.uploadFeaturedImage(savedArticle.getId(), featuredImage);
                savedArticle.setFeaturedImage(imageResponse.getUrl());
                savedArticle = articleRepository.save(savedArticle);
                log.info("Featured image uploaded and set for article: {}", savedArticle.getId());
            } catch (Exception e) {
                log.error("Failed to upload featured image: {}", e.getMessage(), e);
            }
        }
        
        log.info("Article created successfully with ID: {}", savedArticle.getId());
        
        return articleMapper.toDto(savedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleSummaryResponse> getMyDrafts(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting DRAFT articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorIdAndStatus(
                currentUser.getId(), ArticleStatus.DRAFT, pageable);
        
        return articles.map(articleMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleResponse> getMySubmitted(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting PENDING_REVIEW articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorIdAndStatus(
                currentUser.getId(), ArticleStatus.PENDING_REVIEW, pageable);
        
        return articles.map(articleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleResponse> getMyApproved(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting APPROVED articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorIdAndStatus(
                currentUser.getId(), ArticleStatus.APPROVED, pageable);
        
        return articles.map(articleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleResponse> getMyRejected(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting REJECTED articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorIdAndStatus(
                currentUser.getId(), ArticleStatus.REJECTED, pageable);
        
        return articles.map(articleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleResponse> getMyAllArticles(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting all articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorId(currentUser.getId(), pageable);
        
        return articles.map(articleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public NewsArticleResponse getArticleById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting article with ID: {} for user: {}", id, currentUser.getEmail());
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Check if user is the author
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        return articleMapper.toDto(article);
    }

    @Override
    public NewsArticleResponse updateArticle(Long id, UpdateArticleRequest request, MultipartFile featuredImage) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Updating article with ID: {} by user: {}", id, currentUser.getEmail());
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Check if user is the author
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        // Can only update DRAFT or REJECTED articles
        if (article.getStatus() != ArticleStatus.DRAFT && article.getStatus() != ArticleStatus.REJECTED) {
            throw new AppException(ErrorCode.ARTICLE_CANNOT_BE_UPDATED);
        }
        
        // Update fields
        if (request.getTitle() != null) {
            article.setTitle(request.getTitle());
            // Regenerate slug if title changed
            String slug = SlugHelper.generateSlug(request.getTitle());
            if (!slug.equals(article.getSlug())) {
                String originalSlug = slug;
                int counter = 1;
                while (articleRepository.existsBySlug(slug)) {
                    slug = originalSlug + "-" + counter;
                    counter++;
                }
                article.setSlug(slug);
            }
        }
        
        if (request.getDescription() != null) {
            article.setDescription(request.getDescription());
        }
        
        if (request.getContent() != null) {
            article.setContent(request.getContent());
            article.setPlainText(Jsoup.parse(request.getContent()).text());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            article.setCategory(category);
        }
        
        if (featuredImage != null && !featuredImage.isEmpty()) {
            // Upload new file and set URL
            try {
                var imageResponse = imageService.uploadFeaturedImage(article.getId(), featuredImage);
                article.setFeaturedImage(imageResponse.getUrl());
                log.info("Featured image uploaded for article: {}", article.getId());
            } catch (Exception e) {
                log.error("Failed to upload featured image: {}", e.getMessage(), e);
            }
        } else if (request.getFeaturedImage() != null) {
            article.setFeaturedImage(request.getFeaturedImage().isEmpty() ? null : request.getFeaturedImage());
        }
        
        if (article.getStatus() == ArticleStatus.REJECTED) {
            article.setStatus(ArticleStatus.DRAFT);
            article.setRejectionReason(null);
        }
        
        NewsArticle updatedArticle = articleRepository.save(article);
        log.info("Article updated successfully with ID: {}", updatedArticle.getId());
        
        return articleMapper.toDto(updatedArticle);
    }

    @Override
    public void deleteArticle(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Deleting article with ID: {} by user: {}", id, currentUser.getEmail());
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Check if user is the author
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        // Can only delete DRAFT articles
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new AppException(ErrorCode.ARTICLE_CANNOT_BE_DELETED);
        }
        
        articleRepository.delete(article);
        log.info("Article deleted successfully with ID: {}", id);
    }

    @Override
    public NewsArticleResponse submitForReview(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Submitting article ID: {} for review by user: {}", id, currentUser.getEmail());
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Check if user is the author
        if (!article.getAuthor().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        // Can only submit DRAFT articles
        if (article.getStatus() != ArticleStatus.DRAFT) {
            throw new AppException(ErrorCode.ARTICLE_CANNOT_BE_SUBMITTED);
        }
        
        article.setStatus(ArticleStatus.PENDING_REVIEW);
        NewsArticle updatedArticle = articleRepository.save(article);
        log.info("Article submitted for review successfully with ID: {}", updatedArticle.getId());
        
        return articleMapper.toDto(updatedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleSummaryResponse> getPendingReviewArticles(Pageable pageable) {
        log.info("Getting PENDING_REVIEW articles for admin");
        
        Page<NewsArticle> articles = articleRepository.findByStatus(ArticleStatus.PENDING_REVIEW, pageable);
        
        return articles.map(articleMapper::toSummaryDto);
    }

    @Override
    public NewsArticleSummaryResponse approveArticle(Long id) {
        log.info("Approving article with ID: {}", id);
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Can only approve PENDING_REVIEW articles
        if (article.getStatus() != ArticleStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.ARTICLE_CANNOT_BE_APPROVED);
        }
        
        article.setStatus(ArticleStatus.APPROVED);
        article.setPublishedAt(Instant.now());
        article.setRejectionReason(null);
        
        NewsArticle updatedArticle = articleRepository.save(article);
        log.info("Article approved successfully with ID: {}", updatedArticle.getId());
        
        return articleMapper.toSummaryDto(updatedArticle);
    }

    @Override
    public NewsArticleSummaryResponse rejectArticle(Long id, RejectArticleRequest request) {
        log.info("Rejecting article with ID: {}", id);
        
        NewsArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));
        
        // Can only reject PENDING_REVIEW articles
        if (article.getStatus() != ArticleStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.ARTICLE_CANNOT_BE_REJECTED);
        }
        
        article.setStatus(ArticleStatus.REJECTED);
        article.setRejectionReason(request.getRejectionReason());
        article.setPublishedAt(null);
        
        NewsArticle updatedArticle = articleRepository.save(article);
        log.info("Article rejected successfully with ID: {}", updatedArticle.getId());
        
        return articleMapper.toSummaryDto(updatedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleSummaryResponse> getArticlesByCategory(Long id, Pageable pageable) {
        log.info("Getting articles for category with ID: {}", id);

        // Verify category exists
        if (!categoryRepository.existsById(id)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        Page<NewsArticle> articles = articleRepository.findByCategoryId(id, pageable);
        return articles.map(articleMapper::toSummaryDto);
    }
}