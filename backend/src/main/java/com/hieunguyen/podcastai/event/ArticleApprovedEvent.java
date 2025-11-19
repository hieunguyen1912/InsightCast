package com.hieunguyen.podcastai.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ArticleApprovedEvent extends ApplicationEvent {
    private final Long articleId;
    private final Long authorId;
    private final String articleTitle;

    public ArticleApprovedEvent(Object source, Long articleId, Long authorId,
                                String articleTitle) {
        super(source);
        this.articleId = articleId;
        this.authorId = authorId;
        this.articleTitle = articleTitle;
    }
}