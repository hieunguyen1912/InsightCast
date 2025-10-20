package com.hieunguyen.podcastai.specification;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpecSearchCriteria {

    private final String key;
    private final SearchOperation operation;
    private final Object value;
    private final boolean orPredicate;

    public SpecSearchCriteria(String key, SearchOperation operation, Object value, boolean orPredicate) {
        this.key = key;
        this.operation = operation;
        this.value = value;
        this.orPredicate = orPredicate;
    }
}
