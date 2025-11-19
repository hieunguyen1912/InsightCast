package com.hieunguyen.podcastai.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ArticleSubmittedEvent extends ApplicationEvent {
    private final Long articleId;
    private final Long authorId;
    private final String articleTitle;
    private final String authorName;

    public ArticleSubmittedEvent(Object source, Long articleId, Long authorId,
                                 String articleTitle, String authorName) {
        super(source);
        this.articleId = articleId;
        this.authorId = authorId;
        this.articleTitle = articleTitle;
        this.authorName = authorName;
    }
}