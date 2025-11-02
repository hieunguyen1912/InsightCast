package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.entity.NewsArticle;
import com.hieunguyen.podcastai.service.NewsContentExtractionService;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.web.client.RestTemplate;


@Service
@RequiredArgsConstructor
@Slf4j
public class NewsContentExtractionServiceImpl implements NewsContentExtractionService {

    private final RestTemplate restTemplate;

    private static final int READ_TIMEOUT = 10000;

    // User-Agent để tránh bị block
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

    @Override
    public String extractFullContent(String url) {
        if (url == null || url.trim().isEmpty()) {
            log.warn("URL is null or empty");
            return null;
        }

        try {
            log.info("Extracting content from URL: {}", url);

            // Fetch HTML từ URL
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(READ_TIMEOUT)
                    .followRedirects(true)
                    .get();

            removeUnwantedElements(doc);

            String content = extractMainContent(doc);

            if (content != null && content.trim().length() > 100) {
                log.info("Successfully extracted {} characters from URL: {}", content.length(), url);
                return cleanContent(content);
            } else {
                log.warn("Extracted content too short from URL: {}", url);
                return null;
            }

        } catch (org.jsoup.HttpStatusException e) {
            log.error("HTTP error extracting content from {}: {}", url, e.getStatusCode());
            return null;
        } catch (java.net.SocketTimeoutException e) {
            log.error("Timeout extracting content from {}: {}", url, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Error extracting content from {}: {}", url, e.getMessage(), e);
            return null;
        }
    }

    private String extractMainContent(Document doc) {
        // Thứ tự ưu tiên các selector
        String[] selectors = {
                "article",
                "[role='article']",
                ".article-body",
                ".post-content",
                ".entry-content",
                ".article-content",
                ".story-body",
                ".content-body",
                "#article-body",
                ".article-text",
                "main",
                ".main-content"
        };

        for (String selector : selectors) {
            Elements elements = doc.select(selector);
            if (!elements.isEmpty()) {
                Element article = elements.first();
                String text = article.text();
                if (text != null && text.length() > 200) {
                    return text;
                }
            }
        }

        // Fallback: lấy tất cả paragraph trong body
        Elements paragraphs = doc.select("body p");
        if (!paragraphs.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (Element p : paragraphs) {
                String text = p.text();
                if (text != null && text.length() > 50) {
                    sb.append(text).append("\n\n");
                }
            }
            if (sb.length() > 200) {
                return sb.toString();
            }
        }

        Element body = doc.body();
        if (body != null) {
            return body.text();
        }

        return null;
    }

    private void removeUnwantedElements(Document doc) {
        doc.select("script, style, noscript, iframe, embed, object, form").remove();

        doc.select("[class*='ad'], [class*='advertisement'], [id*='ad'], [id*='advertisement']").remove();
        doc.select("[class*='sidebar'], [class*='comment'], [class*='footer'], [class*='header']").remove();
        doc.select("[class*='nav'], [class*='menu'], [class*='social']").remove();

        doc.select(".related, .recommend, .trending, .popular").remove();
    }

    private String cleanContent(String content) {
        if (content == null) return null;

        content = content.replaceAll("\\s+", " ")
                .replaceAll("\\n\\s*\\n", "\n\n")
                .trim();

        if (content.length() > 50000) {
            content = content.substring(0, 50000) + "...";
            log.warn("Content truncated to 50000 characters");
        }

        return content;
    }

    @Override
    public NewsArticle enrichArticleWithFullContent(NewsArticle article) {
        if (article == null || article.getUrl() == null) {
            return article;
        }

        if (article.getContent() != null && article.getContent().length() > 500) {
            log.debug("Article already has full content, skipping extraction");
            return article;
        }

        String fullContent = extractFullContent(article.getUrl());
        if (fullContent != null && !fullContent.trim().isEmpty()) {
            article.setContent(fullContent);
            log.info("Enriched article with full content: {}", article.getTitle());
        } else {
            log.warn("Could not extract full content for article: {}", article.getTitle());
        }

        return article;
    }
}
