package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.GenerateSummaryRequest;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.service.ArticleSummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jsoup.Jsoup;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ArticleSummaryServiceImpl implements ArticleSummaryService {

    private final ChatClient chatClient;

    @Override
    public String generateSummary(GenerateSummaryRequest request) {
        log.info("Generating summary with maxLength: {}, language: {}", 
                request.getMaxLength(), request.getLanguage());
        
        String plainText = Jsoup.parse(request.getContent()).text();

        String prompt = buildPrompt(plainText, request.getMaxLength(), request.getLanguage());
        log.debug("Generated prompt: {}", prompt);

        String summary;
        try {
            summary = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            
            if (summary == null || summary.trim().isEmpty()) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            log.info("Summary generated successfully, length: {}", summary.length());

        } catch (Exception e) {
            log.error("Error calling Gemini AI: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }


        return summary.trim();
    }

    private String buildPrompt(String content, Integer maxLength, String language) {
        String languageName = "vi".equalsIgnoreCase(language) ? "tiếng Việt" : "English";
        
        return String.format(
                "Hãy tóm tắt bài viết sau đây trong khoảng %d từ bằng %s. " +
                "Tóm tắt phải ngắn gọn, súc tích và nắm bắt được ý chính của bài viết:\n\n%s",
                maxLength, languageName, content
        );
    }
}

