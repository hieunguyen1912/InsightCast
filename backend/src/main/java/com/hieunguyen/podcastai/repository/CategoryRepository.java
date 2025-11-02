package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);

    Optional<Category> findBySlugIgnoreCase(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlugIgnoreCase(String slug);

    // Find root categories (categories without parent)
    List<Category> findByParentIsNull();
    
    // Find children of a category
    List<Category> findByParentId(Long parentId);
}
