package com.hieunguyen.podcastai.validation;

import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
@Slf4j
public class SearchValidator {

    private static final int MAX_KEYWORD_LENGTH = 100;
    private static final int MIN_KEYWORD_LENGTH = 1;


    private static final Pattern INVALID_CHARS =
            Pattern.compile("[<>|&()!*'\\\\]");


    public String sanitizeKeyword(String keyword) throws AppException {
        // Step 1: Null/Empty check
        if (keyword == null || keyword.isBlank()) {
            throw new AppException(ErrorCode.INVALID_SEARCH_INPUT);
        }

        // Step 2: Max length check
        if (keyword.length() > MAX_KEYWORD_LENGTH) {
            throw new AppException(ErrorCode.INVALID_SEARCH_INPUT);
        }

        // Step 3: Remove dangerous chars + normalize
        String sanitized = INVALID_CHARS.matcher(keyword)
                .replaceAll("")           // Remove invalid chars
                .trim()                   // Remove leading/trailing spaces
                .toLowerCase();           // Convert to lowercase

        // Step 4: Min length check after cleaning
        if (sanitized.length() < MIN_KEYWORD_LENGTH) {
            throw new AppException(ErrorCode.INVALID_SEARCH_INPUT);
        }

        // Step 5: Log for audit trail
        log.debug("Sanitized keyword: '{}' -> '{}'", keyword, sanitized);

        return sanitized;
    }
}
