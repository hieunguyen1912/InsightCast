package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.CreateArticleRequest;
import com.hieunguyen.podcastai.dto.request.UpdateArticleRequest;
import com.hieunguyen.podcastai.dto.response.NewsArticleResponse;
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
import com.hieunguyen.podcastai.util.SecurityUtils;
import com.hieunguyen.podcastai.util.SlugHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements ArticleService {

    private final NewsArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final NewsArticleMapper articleMapper;
    private final SecurityUtils securityUtils;

    @Override
    public NewsArticleResponse createArticle(CreateArticleRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Creating article with title: {} by user: {}", request.getTitle(), currentUser.getEmail());
        
        // Get category
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
        
        // Create article
        NewsArticle article = NewsArticle.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .content(request.getContent())
                .plainText(plainText)
                .slug(slug)
                .featuredImage(request.getFeaturedImage())
                .author(currentUser)
                .category(category)
                .status(ArticleStatus.DRAFT)
                .viewCount(0L)
                .likeCount(0L)
                .shareCount(0L)
                .build();
        
        NewsArticle savedArticle = articleRepository.save(article);
        log.info("Article created successfully with ID: {}", savedArticle.getId());
        
        return articleMapper.toDto(savedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsArticleResponse> getMyDrafts(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting DRAFT articles for user: {}", currentUser.getEmail());
        
        Page<NewsArticle> articles = articleRepository.findByAuthorIdAndStatus(
                currentUser.getId(), ArticleStatus.DRAFT, pageable);
        
        return articles.map(articleMapper::toDto);
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
    public NewsArticleResponse updateArticle(Long id, UpdateArticleRequest request) {
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
        
        if (request.getFeaturedImage() != null) {
            article.setFeaturedImage(request.getFeaturedImage());
        }
        
        // If article was REJECTED, reset status to DRAFT
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
}

