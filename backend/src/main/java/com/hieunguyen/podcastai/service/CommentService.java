package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.CreateCommentRequest;
import com.hieunguyen.podcastai.dto.request.UpdateCommentRequest;
import com.hieunguyen.podcastai.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(Long articleId, CreateCommentRequest createCommentRequest);

    CommentResponse updateComment(Long articleId, Long commentId, UpdateCommentRequest updateCommentRequest);

    void deleteComment(Long articleId, Long commentId);

    List<CommentResponse> getCommentsByArticleId(Long articleId);

    List<CommentResponse> getRepliesByCommentId(Long commentId);
}
