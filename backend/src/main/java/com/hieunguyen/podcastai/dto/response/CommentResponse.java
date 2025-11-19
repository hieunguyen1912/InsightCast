package com.hieunguyen.podcastai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;

    private CommentUserDto user;

    private Long parentId;

    private Long repliesCount;

    private List<CommentResponse> replies;

    @Setter
    @Getter
    @Builder
    @AllArgsConstructor
    public static class CommentUserDto {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String avatarUrl;
    }
}
