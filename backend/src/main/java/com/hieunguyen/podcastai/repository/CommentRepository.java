package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c " +
           "WHERE c.article.id = :articleId AND c.parent IS NULL " +
           "ORDER BY c.createdAt DESC")
    List<Comment> findByArticleIdAndParentIsNullOrderByCreatedAtDesc(@Param("articleId") Long articleId);

    @Query("SELECT c FROM Comment c " +
           "WHERE c.parent.id = :parentId " +
           "ORDER BY c.createdAt ASC")
    List<Comment> findByParentIdOrderByCreatedAtAsc(@Param("parentId") Long parentId);

    long countByArticleId(Long articleId);

    long countByArticleIdAndParentIsNull(Long articleId);
}
