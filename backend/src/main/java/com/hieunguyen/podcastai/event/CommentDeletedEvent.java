package com.hieunguyen.podcastai.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentDeletedEvent extends ApplicationEvent {
    private final Long articleId;
    private final Long commentId;
    
    public CommentDeletedEvent(Object source, Long articleId, Long commentId) {
        super(source);
        this.articleId = articleId;
        this.commentId = commentId;
    }
}

