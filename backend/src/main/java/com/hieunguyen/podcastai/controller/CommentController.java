package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.CreateCommentRequest;
import com.hieunguyen.podcastai.dto.request.UpdateCommentRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.CommentResponse;
import com.hieunguyen.podcastai.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/articles/{articleId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long articleId,
            @RequestBody @Valid CreateCommentRequest request) {
        log.info("Creating comment for article ID: {}", articleId);
        
        CommentResponse comment = commentService.createComment(articleId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.created("Comment created successfully", comment));
    }

    @GetMapping("/articles/{articleId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable("articleId") Long articleId) {
        log.info("Getting comments for article ID: {}", articleId);
        
        List<CommentResponse> comments = commentService.getCommentsByArticleId(articleId);
        
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
    }

    @PutMapping("/articles/{articleId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable("articleId") Long articleId,
            @PathVariable("commentId") Long commentId,
            @Valid @RequestBody UpdateCommentRequest updateCommentRequest) {
        log.info("Updating comment ID: {} for article ID: {}", commentId, articleId);
        
        CommentResponse comment = commentService.updateComment(articleId, commentId, updateCommentRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
    }

    @DeleteMapping("/articles/{articleId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable("articleId") Long articleId,
            @PathVariable("commentId") Long commentId) {
        log.info("Deleting comment ID: {} for article ID: {}", commentId, articleId);
        
        commentService.deleteComment(articleId, commentId);
        
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getReplies(
            @PathVariable("commentId") Long commentId) {
        log.info("Getting replies for comment ID: {}", commentId);
        
        List<CommentResponse> replies = commentService.getRepliesByCommentId(commentId);
        
        return ResponseEntity.ok(ApiResponse.success("Replies retrieved successfully", replies));
    }
}

