package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;


@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long>, JpaSpecificationExecutor<NewsArticle> {

    @Query(
        value = "SELECT n.* FROM news_articles n " +
                "WHERE n.status = 2 " + // 2 = ArticleStatus.APPROVED (ordinal: DRAFT=0, PENDING_REVIEW=1, APPROVED=2, REJECTED=3)
                "AND (CAST(:keyword AS TEXT) IS NULL OR n.search_vector @@ plainto_tsquery('english', CAST(:keyword AS TEXT))) " +
                "AND (CAST(:categoryId AS BIGINT) IS NULL OR n.category_id = :categoryId) " +
                "AND (CAST(:fromDate AS TIMESTAMP) IS NULL OR n.published_at >= :fromDate) " +
                "AND (CAST(:toDate AS TIMESTAMP) IS NULL OR n.published_at <= :toDate) " +
                "ORDER BY " +
                "  CASE WHEN CAST(:keyword AS TEXT) IS NOT NULL THEN ts_rank(n.search_vector, plainto_tsquery('english', CAST(:keyword AS TEXT))) END DESC, " +
                "  n.published_at DESC",
        nativeQuery = true
    )
    Page<NewsArticle> fullTextSearch(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            Pageable pageable);

    Page<NewsArticle> findByCategoryId(Long categoryId, Pageable pageable);
    
    Page<NewsArticle> findByCategoryIdAndStatus(Long categoryId, ArticleStatus status, Pageable pageable);
    
    Optional<NewsArticle> findByIdAndStatus(Long id, ArticleStatus status);
    
    Page<NewsArticle> findByStatus(ArticleStatus status, Pageable pageable);
    
    // Journalist queries
    Page<NewsArticle> findByAuthorIdAndStatus(Long authorId, ArticleStatus status, Pageable pageable);
    
    Page<NewsArticle> findByAuthorId(Long authorId, Pageable pageable);
    
    boolean existsBySlug(String slug);
    
    // Stats queries
    long countByStatus(ArticleStatus status);
    
    long countByStatusAndCreatedAtBetween(ArticleStatus status, Instant start, Instant end);
    
    @Query("SELECT COUNT(a) FROM NewsArticle a WHERE a.status = :status " +
           "AND a.createdAt >= :startDate AND a.createdAt < :endDate")
    long countByStatusAndCreatedAtDate(@Param("status") ArticleStatus status, 
                                       @Param("startDate") Instant startDate,
                                       @Param("endDate") Instant endDate);
    
    @Query("SELECT a.author.id, a.author.firstName, a.author.lastName, a.author.email, " +
           "COUNT(a) as totalArticles, " +
           "SUM(CASE WHEN a.status = :approvedStatus THEN 1 ELSE 0 END) as approvedArticles, " +
           "SUM(CASE WHEN a.status = :pendingStatus THEN 1 ELSE 0 END) as pendingArticles, " +
           "SUM(CASE WHEN a.status = :rejectedStatus THEN 1 ELSE 0 END) as rejectedArticles " +
           "FROM NewsArticle a " +
           "GROUP BY a.author.id, a.author.firstName, a.author.lastName, a.author.email " +
           "ORDER BY totalArticles DESC")
    List<Object[]> findTopAuthorsWithStats(
            @Param("approvedStatus") ArticleStatus approvedStatus,
            @Param("pendingStatus") ArticleStatus pendingStatus,
            @Param("rejectedStatus") ArticleStatus rejectedStatus,
            Pageable pageable);
    
    @Query("SELECT c.name, COUNT(a) as articleCount " +
           "FROM NewsArticle a " +
           "LEFT JOIN a.category c " +
           "GROUP BY c.id, c.name " +
           "ORDER BY articleCount DESC")
    List<Object[]> findArticleCountsByCategory();
    
    @Query(value = "SELECT DATE(a.created_at) as date, " +
           "SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END) as created, " + // DRAFT = 0
           "SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) as submitted, " + // PENDING_REVIEW = 1
           "SUM(CASE WHEN a.status = 2 THEN 1 ELSE 0 END) as approved, " + // APPROVED = 2
           "SUM(CASE WHEN a.status = 3 THEN 1 ELSE 0 END) as rejected " + // REJECTED = 3
           "FROM news_articles a " +
           "WHERE a.created_at >= :startDate " +
           "GROUP BY DATE(a.created_at) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<Object[]> findDailyTrends(@Param("startDate") Instant startDate);
    
    @Query("SELECT COUNT(a) FROM NewsArticle a " +
           "WHERE a.status = :pendingStatus " +
           "AND a.createdAt < :beforeDate")
    long countPendingOlderThan(@Param("pendingStatus") ArticleStatus pendingStatus,
                               @Param("beforeDate") Instant beforeDate);
    
    @Query("SELECT SUM(a.viewCount) FROM NewsArticle a")
    Long sumViewCount();
    
    @Query("SELECT SUM(a.likeCount) FROM NewsArticle a")
    Long sumLikeCount();
    
    @Query("SELECT a FROM NewsArticle a " +
           "WHERE a.status = :approvedStatus " +
           "ORDER BY (a.viewCount + a.likeCount) DESC")
    List<NewsArticle> findPopularArticles(@Param("approvedStatus") ArticleStatus approvedStatus,
                                          Pageable pageable);
    
}