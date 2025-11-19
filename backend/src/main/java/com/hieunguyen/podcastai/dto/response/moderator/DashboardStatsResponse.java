package com.hieunguyen.podcastai.dto.response.moderator;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardStatsResponse {
    private Long totalArticles;
    private Long pendingReviewCount;
    private Long totalUsers;
    private Long activeUsers;
    private Long totalViews;
    private Long totalLikes;
    private Long articlesApprovedToday;
    private Long articlesRejectedToday;
}

