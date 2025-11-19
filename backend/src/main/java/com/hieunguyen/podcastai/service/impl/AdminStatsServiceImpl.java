package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.moderator.*;
import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import com.hieunguyen.podcastai.enums.UserStatus;
import com.hieunguyen.podcastai.repository.CommentRepository;
import com.hieunguyen.podcastai.repository.NewsArticleRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsServiceImpl implements AdminStatsService {

    private final NewsArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        log.info("Getting dashboard stats");
        
        Instant todayStart = getStartOfDay(Instant.now());
        Instant todayEnd = getEndOfDay(Instant.now());
        
        Long totalArticles = articleRepository.count();
        Long pendingReviewCount = articleRepository.countByStatus(ArticleStatus.PENDING_REVIEW);
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        
        Long totalViews = articleRepository.sumViewCount();
        Long totalLikes = articleRepository.sumLikeCount();
        
        Long articlesApprovedToday = articleRepository.countByStatusAndCreatedAtDate(
            ArticleStatus.APPROVED, todayStart, todayEnd);
        Long articlesRejectedToday = articleRepository.countByStatusAndCreatedAtDate(
            ArticleStatus.REJECTED, todayStart, todayEnd);
        
        return DashboardStatsResponse.builder()
                .totalArticles(totalArticles)
                .pendingReviewCount(pendingReviewCount)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalViews(totalViews != null ? totalViews : 0L)
                .totalLikes(totalLikes != null ? totalLikes : 0L)
                .articlesApprovedToday(articlesApprovedToday)
                .articlesRejectedToday(articlesRejectedToday)
                .build();
    }

    @Override
    public ArticleStatsResponse getArticleStats(LocalDate fromDate, LocalDate toDate) {
        log.info("Getting article stats from {} to {}", fromDate, toDate);
        
        Map<ArticleStatus, Long> articlesByStatus = new EnumMap<>(ArticleStatus.class);
        for (ArticleStatus status : ArticleStatus.values()) {
            articlesByStatus.put(status, articleRepository.countByStatus(status));
        }
        
        Long totalArticles = articleRepository.count();
        
        Instant todayStart = getStartOfDay(Instant.now());
        Instant todayEnd = getEndOfDay(Instant.now());
        Long approvedToday = articleRepository.countByStatusAndCreatedAtDate(
            ArticleStatus.APPROVED, todayStart, todayEnd);
        Long rejectedToday = articleRepository.countByStatusAndCreatedAtDate(
            ArticleStatus.REJECTED, todayStart, todayEnd);
        Long submittedToday = articleRepository.countByStatusAndCreatedAtDate(
            ArticleStatus.PENDING_REVIEW, todayStart, todayEnd);
        
        // Calculate approval rate
        Long approved = articleRepository.countByStatus(ArticleStatus.APPROVED);
        Long rejected = articleRepository.countByStatus(ArticleStatus.REJECTED);
        Double approvalRate = null;
        if (approved + rejected > 0) {
            approvalRate = (approved.doubleValue() / (approved + rejected)) * 100.0;
        }
        
        // Articles by category
        List<Object[]> categoryStats = articleRepository.findArticleCountsByCategory();
        Map<String, Long> articlesByCategory = categoryStats.stream()
                .collect(Collectors.toMap(
                    arr -> arr[0] != null ? arr[0].toString() : "Uncategorized",
                    arr -> ((Number) arr[1]).longValue()
                ));
        
        return ArticleStatsResponse.builder()
                .articlesByStatus(articlesByStatus)
                .totalArticles(totalArticles)
                .approvedToday(approvedToday)
                .rejectedToday(rejectedToday)
                .submittedToday(submittedToday)
                .approvalRate(approvalRate)
                .articlesByCategory(articlesByCategory)
                .build();
    }

    @Override
    public UserStatsResponse getUserStats() {
        log.info("Getting user stats");
        
        Map<UserStatus, Long> usersByStatus = new EnumMap<>(UserStatus.class);
        for (UserStatus status : UserStatus.values()) {
            usersByStatus.put(status, userRepository.countByStatus(status));
        }
        
        Long totalUsers = userRepository.count();
        
        Instant now = Instant.now();
        Instant todayStart = getStartOfDay(now);
        Instant todayEnd = getEndOfDay(now);
        Instant weekStart = todayStart.minus(7, ChronoUnit.DAYS);
        Instant monthStart = todayStart.minus(30, ChronoUnit.DAYS);
        
        Long newUsersToday = userRepository.countByCreatedAtBetween(todayStart, todayEnd);
        Long newUsersThisWeek = userRepository.countByCreatedAtBetween(weekStart, now);
        Long newUsersThisMonth = userRepository.countByCreatedAtBetween(monthStart, now);
        
        return UserStatsResponse.builder()
                .usersByStatus(usersByStatus)
                .totalUsers(totalUsers)
                .newUsersToday(newUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .newUsersThisMonth(newUsersThisMonth)
                .build();
    }

    @Override
    public PendingReviewStatsResponse getPendingReviewStats() {
        log.info("Getting pending review stats");
        
        Long totalPending = articleRepository.countByStatus(ArticleStatus.PENDING_REVIEW);
        
        Instant now = Instant.now();
        Instant twentyFourHoursAgo = now.minus(24, ChronoUnit.HOURS);
        Instant fortyEightHoursAgo = now.minus(48, ChronoUnit.HOURS);
        
        Long pendingOlderThan24Hours = articleRepository.countPendingOlderThan(
                ArticleStatus.PENDING_REVIEW, twentyFourHoursAgo);
        Long pendingOlderThan48Hours = articleRepository.countPendingOlderThan(
                ArticleStatus.PENDING_REVIEW, fortyEightHoursAgo);
        
        return PendingReviewStatsResponse.builder()
                .totalPending(totalPending)
                .pendingOlderThan24Hours(pendingOlderThan24Hours)
                .pendingOlderThan48Hours(pendingOlderThan48Hours)
                .build();
    }

    @Override
    public ArticleTrendsResponse getArticleTrends(int days) {
        log.info("Getting article trends for last {} days", days);
        
        if (days <= 0) {
            days = 7; // Default to 7 days
        }
        
        Instant startDate = Instant.now().minus(days, ChronoUnit.DAYS);
        List<Object[]> trends = articleRepository.findDailyTrends(startDate);
        
        List<ArticleTrendsResponse.DailyStats> dailyStatsList = trends.stream()
                .map(arr -> {
                    String date = arr[0].toString(); // Date as string
                    Long created = ((Number) arr[1]).longValue();
                    Long submitted = ((Number) arr[2]).longValue();
                    Long approved = ((Number) arr[3]).longValue();
                    Long rejected = ((Number) arr[4]).longValue();
                    
                    return ArticleTrendsResponse.DailyStats.builder()
                            .date(date)
                            .created(created)
                            .submitted(submitted)
                            .approved(approved)
                            .rejected(rejected)
                            .build();
                })
                .collect(Collectors.toList());
        
        return ArticleTrendsResponse.builder()
                .dailyStats(dailyStatsList)
                .build();
    }

    @Override
    public TopAuthorsResponse getTopAuthors(int limit) {
        log.info("Getting top {} authors", limit);
        
        if (limit <= 0) {
            limit = 10; // Default to 10
        }
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> authorsData = articleRepository.findTopAuthorsWithStats(
                ArticleStatus.APPROVED,
                ArticleStatus.PENDING_REVIEW,
                ArticleStatus.REJECTED,
                pageable);
        
        List<TopAuthorsResponse.AuthorStats> authors = authorsData.stream()
                .map(arr -> {
                    Long id = ((Number) arr[0]).longValue();
                    String firstName = arr[1] != null ? arr[1].toString() : "";
                    String lastName = arr[2] != null ? arr[2].toString() : "";
                    String email = arr[3] != null ? arr[3].toString() : "";
                    Long totalArticles = ((Number) arr[4]).longValue();
                    Long approvedArticles = ((Number) arr[5]).longValue();
                    Long pendingArticles = ((Number) arr[6]).longValue();
                    Long rejectedArticles = ((Number) arr[7]).longValue();
                    
                    String name = (firstName + " " + lastName).trim();
                    if (name.isEmpty()) {
                        name = email;
                    }
                    
                    return TopAuthorsResponse.AuthorStats.builder()
                            .id(id)
                            .name(name)
                            .email(email)
                            .totalArticles(totalArticles)
                            .approvedArticles(approvedArticles)
                            .pendingArticles(pendingArticles)
                            .rejectedArticles(rejectedArticles)
                            .build();
                })
                .collect(Collectors.toList());
        
        return TopAuthorsResponse.builder()
                .authors(authors)
                .build();
    }

    @Override
    public EngagementStatsResponse getEngagementStats() {
        log.info("Getting engagement stats");
        
        Long totalViews = articleRepository.sumViewCount();
        Long totalLikes = articleRepository.sumLikeCount();
        Long totalComments = commentRepository.count();
        
        // Get top 10 popular articles
        Pageable pageable = PageRequest.of(0, 10);
        List<NewsArticle> popularArticles = articleRepository.findPopularArticles(
                ArticleStatus.APPROVED, pageable);
        
        List<EngagementStatsResponse.PopularArticle> popularArticlesList = popularArticles.stream()
                .map(article -> EngagementStatsResponse.PopularArticle.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .views(article.getViewCount())
                        .likes(article.getLikeCount())
                        .build())
                .collect(Collectors.toList());
        
        return EngagementStatsResponse.builder()
                .totalViews(totalViews != null ? totalViews : 0L)
                .totalLikes(totalLikes != null ? totalLikes : 0L)
                .totalComments(totalComments)
                .popularArticles(popularArticlesList)
                .build();
    }
    
    private Instant getStartOfDay(Instant instant) {
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        LocalDateTime startOfDay = localDateTime.toLocalDate().atStartOfDay();
        return startOfDay.atZone(ZoneId.systemDefault()).toInstant();
    }
    
    private Instant getEndOfDay(Instant instant) {
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        LocalDateTime endOfDay = localDateTime.toLocalDate().atTime(23, 59, 59, 999999999);
        return endOfDay.atZone(ZoneId.systemDefault()).toInstant();
    }
}

