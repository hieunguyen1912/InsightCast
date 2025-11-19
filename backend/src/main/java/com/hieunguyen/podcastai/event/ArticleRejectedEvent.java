package com.hieunguyen.podcastai.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ArticleRejectedEvent extends ApplicationEvent {
    private final Long articleId;
    private final Long authorId;
    private final String articleTitle;
    private final String rejectionReason;

    public ArticleRejectedEvent(Object source, Long articleId, Long authorId,
                                String articleTitle, String rejectionReason) {
        super(source);
        this.articleId = articleId;
        this.authorId = authorId;
        this.articleTitle = articleTitle;
        this.rejectionReason = rejectionReason;
    }
}
