package com.hieunguyen.podcastai.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import lombok.Getter;

import static com.hieunguyen.podcastai.specification.SearchOperation.*;

@Getter
public class SpecificationsBuilder<T> {

    private final List<SpecSearchCriteria> params;

    public SpecificationsBuilder() {
        params = new ArrayList<>();
    }

    // API
    public SpecificationsBuilder<T> with(final String key, final String operation, final Object value, final String prefix, final String suffix) {
        return with(null, key, operation, value, prefix, suffix);
    }

    public SpecificationsBuilder<T> with(final String orPredicate, final String key, final String operation, final Object value, final String prefix, final String suffix) {
        SearchOperation searchOperation = SearchOperation.getSimpleOperation(operation.charAt(0));
        if (searchOperation != null) {
            if (searchOperation == EQUALITY) { // the operation may be complex operation
                final boolean startWithAsterisk = prefix != null && prefix.contains(ZERO_OR_MORE_REGEX);
                final boolean endWithAsterisk = suffix != null && suffix.contains(ZERO_OR_MORE_REGEX);

                if (startWithAsterisk && endWithAsterisk) {
                    searchOperation = CONTAINS;
                } else if (startWithAsterisk) {
                    searchOperation = ENDS_WITH;
                } else if (endWithAsterisk) {
                    searchOperation = STARTS_WITH;
                }
            }
            params.add(SpecSearchCriteria.builder()
                .key(key)
                .operation(searchOperation)
                .value(value)
                .orPredicate(orPredicate != null && orPredicate.equals(OR_PREDICATE_FLAG))
                .build());
        }
        return this;
    }

    public Specification<T> build() {
        if (params.isEmpty())
            return null;

        Specification<T> result = new BaseSpecification<T>(params.get(0));

        for (int i = 1; i < params.size(); i++) {
            result = params.get(i).isOrPredicate()
                    ? result.or(new BaseSpecification<T>(params.get(i)))
                    : result.and(new BaseSpecification<T>(params.get(i)));
        }

        return result;
    }
}
