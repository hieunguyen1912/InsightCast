package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.response.moderator.*;

import java.time.LocalDate;

public interface AdminStatsService {
    
    DashboardStatsResponse getDashboardStats();
    
    ArticleStatsResponse getArticleStats(LocalDate fromDate, LocalDate toDate);
    
    UserStatsResponse getUserStats();
    
    PendingReviewStatsResponse getPendingReviewStats();
    
    ArticleTrendsResponse getArticleTrends(int days);
    
    TopAuthorsResponse getTopAuthors(int limit);
    
    EngagementStatsResponse getEngagementStats();
}

