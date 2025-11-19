package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.moderator.*;
import com.hieunguyen.podcastai.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/stats")
@Slf4j
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        log.info("Getting dashboard stats for admin");
        DashboardStatsResponse stats = adminStatsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    @GetMapping("/articles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ArticleStatsResponse>> getArticleStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        log.info("Getting article stats - from: {}, to: {}", fromDate, toDate);
        ArticleStatsResponse stats = adminStatsService.getArticleStats(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Article stats retrieved successfully", stats));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats() {
        log.info("Getting user stats");
        UserStatsResponse stats = adminStatsService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success("User stats retrieved successfully", stats));
    }

    @GetMapping("/articles/pending-review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PendingReviewStatsResponse>> getPendingReviewStats() {
        log.info("Getting pending review stats");
        PendingReviewStatsResponse stats = adminStatsService.getPendingReviewStats();
        return ResponseEntity.ok(ApiResponse.success("Pending review stats retrieved successfully", stats));
    }

    @GetMapping("/articles/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ArticleTrendsResponse>> getArticleTrends(
            @RequestParam(defaultValue = "7") int days) {
        log.info("Getting article trends for last {} days", days);
        ArticleTrendsResponse trends = adminStatsService.getArticleTrends(days);
        return ResponseEntity.ok(ApiResponse.success("Article trends retrieved successfully", trends));
    }

    @GetMapping("/top-authors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TopAuthorsResponse>> getTopAuthors(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Getting top {} authors", limit);
        TopAuthorsResponse topAuthors = adminStatsService.getTopAuthors(limit);
        return ResponseEntity.ok(ApiResponse.success("Top authors retrieved successfully", topAuthors));
    }

    @GetMapping("/engagement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EngagementStatsResponse>> getEngagementStats() {
        log.info("Getting engagement stats");
        EngagementStatsResponse stats = adminStatsService.getEngagementStats();
        return ResponseEntity.ok(ApiResponse.success("Engagement stats retrieved successfully", stats));
    }
}

