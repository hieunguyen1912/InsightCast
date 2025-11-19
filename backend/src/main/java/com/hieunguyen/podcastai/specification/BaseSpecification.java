package com.hieunguyen.podcastai.specification;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class BaseSpecification<T> implements Specification<T> {

    private final SpecSearchCriteria criteria;

    public BaseSpecification(SpecSearchCriteria criteria) {
        this.criteria = criteria;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        // Handle nested fields (e.g., "category.id", "author.id")
        jakarta.persistence.criteria.Path<?> path = getPath(root, criteria.getKey());
        
        return switch (criteria.getOperation()) {
            case EQUALITY -> builder.equal(path, criteria.getValue());
            case NEGATION -> builder.notEqual(path, criteria.getValue());
            case GREATER_THAN -> builder.greaterThan(path.as(String.class), criteria.getValue().toString());
            case LESS_THAN -> builder.lessThan(path.as(String.class), criteria.getValue().toString());
            case LIKE -> builder.like(path.as(String.class), "%" + criteria.getValue().toString() + "%");
            case STARTS_WITH -> builder.like(path.as(String.class), criteria.getValue() + "%");
            case ENDS_WITH -> builder.like(path.as(String.class), "%" + criteria.getValue());
            case CONTAINS -> builder.like(path.as(String.class), "%" + criteria.getValue() + "%");
        };
    }
    
    /**
     * Get path for nested fields (e.g., "category.id" -> root.get("category").get("id"))
     */
    private jakarta.persistence.criteria.Path<?> getPath(Root<T> root, String key) {
        String[] parts = key.split("\\.");
        jakarta.persistence.criteria.Path<?> path = root.get(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            path = path.get(parts[i]);
        }
        return path;
    }

    public SpecSearchCriteria getCriteria() {
        return criteria;
    }
}
