package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.CreateCommentRequest;
import com.hieunguyen.podcastai.dto.request.UpdateCommentRequest;
import com.hieunguyen.podcastai.dto.response.CommentResponse;
import com.hieunguyen.podcastai.entity.Comment;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.CommentMapper;
import com.hieunguyen.podcastai.repository.CommentRepository;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.event.CommentCreatedEvent;
import com.hieunguyen.podcastai.event.CommentDeletedEvent;
import com.hieunguyen.podcastai.event.CommentUpdatedEvent;
import com.hieunguyen.podcastai.service.CommentService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final NewsArticleRepository newsArticleRepository;
    private final SecurityUtils securityUtils;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public CommentResponse createComment(Long articleId, CreateCommentRequest createCommentRequest) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Creating comment for article ID: {} by user: {}", articleId, currentUser.getEmail());

        NewsArticle newsArticle = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new AppException(ErrorCode.ARTICLE_NOT_FOUND));

        Comment parentComment = null;
        if (createCommentRequest.getParentId() != null) {
            parentComment = validateCommentExists(createCommentRequest.getParentId());
            validateCommentBelongsToArticle(parentComment, articleId);
            validateCommentDepth(parentComment);
        }

        Comment comment = Comment.builder()
                .content(createCommentRequest.getContent())
                .user(currentUser)
                .article(newsArticle)
                .parent(parentComment)
                .build();

        Comment savedComment = commentRepository.save(comment);
        log.info("Comment created successfully with ID: {}", savedComment.getId());

        CommentResponse commentResponse = commentMapper.toCommentResponse(savedComment);
        
        eventPublisher.publishEvent(new CommentCreatedEvent(this, articleId, commentResponse));
        
        return commentResponse;
    }

    @Override
    public CommentResponse updateComment(Long articleId, Long commentId, UpdateCommentRequest updateCommentRequest) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Updating comment ID: {} for article ID: {} by user: {}", 
                commentId, articleId, currentUser.getEmail());

        validateArticleExists(articleId);
        Comment comment = validateCommentExists(commentId);
        validateCommentBelongsToArticle(comment, articleId);
        validateUserOwnsComment(comment, currentUser, "update");

        comment.setContent(updateCommentRequest.getContent());

        Comment updatedComment = commentRepository.save(comment);
        log.info("Comment updated successfully with ID: {}", updatedComment.getId());

        CommentResponse commentResponse = commentMapper.toCommentResponse(updatedComment);
        
        // Publish event - will be broadcast after transaction commits
        eventPublisher.publishEvent(new CommentUpdatedEvent(this, articleId, commentResponse));
        
        return commentResponse;
    }

    @Override
    public void deleteComment(Long articleId, Long commentId) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Deleting comment ID: {} for article ID: {} by user: {}", 
                commentId, articleId, currentUser.getEmail());

        validateArticleExists(articleId);
        Comment comment = validateCommentExists(commentId);
        validateCommentBelongsToArticle(comment, articleId);
        validateUserOwnsComment(comment, currentUser, "delete");

        commentRepository.delete(comment);
        log.info("Comment deleted successfully with ID: {}", commentId);
        
        // Publish event - will be broadcast after transaction commits
        eventPublisher.publishEvent(new CommentDeletedEvent(this, articleId, commentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByArticleId(Long articleId) {
        log.info("Getting comments for article ID: {}", articleId);

        validateArticleExists(articleId);

        List<Comment> topLevelComments = commentRepository
                .findByArticleIdAndParentIsNullOrderByCreatedAtDesc(articleId);

        log.info("Found {} top-level comments for article ID: {}", topLevelComments.size(), articleId);

        return commentMapper.toCommentResponseList(topLevelComments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getRepliesByCommentId(Long commentId) {
        log.info("Getting replies for comment ID: {}", commentId);

        if (!commentRepository.existsById(commentId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        List<Comment> replies = commentRepository
                .findByParentIdOrderByCreatedAtAsc(commentId);

        log.info("Found {} replies for comment ID: {}", replies.size(), commentId);

        return commentMapper.toCommentResponseList(replies);
    }

    private void validateArticleExists(Long articleId) {
        if (!newsArticleRepository.existsById(articleId)) {
            throw new AppException(ErrorCode.ARTICLE_NOT_FOUND);
        }
    }

    private Comment validateCommentExists(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private void validateCommentBelongsToArticle(Comment comment, Long articleId) {
        if (!comment.getArticle().getId().equals(articleId)) {
            log.warn("Comment {} does not belong to article {}", 
                    comment.getId(), articleId);
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
    }
    
    private void validateUserOwnsComment(Comment comment, User currentUser, String action) {
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to {} comment {} owned by user {}", 
                    currentUser.getId(), action, comment.getId(), comment.getUser().getId());
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }
    
    private void validateCommentDepth(Comment parentComment) {
        if (parentComment == null) {
            return;
        }
        
        if (parentComment.getParent() != null) {
            log.warn("Attempted to reply to a reply. Parent comment ID: {} has parent ID: {}. Maximum depth is 2 levels.", 
                    parentComment.getId(), parentComment.getParent().getId());
            throw new AppException(ErrorCode.MAX_COMMENT_DEPTH_EXCEEDED);
        }
    }
}
