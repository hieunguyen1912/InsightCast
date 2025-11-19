package com.hieunguyen.podcastai.event;

import com.hieunguyen.podcastai.dto.response.CommentResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentUpdatedEvent extends ApplicationEvent {
    private final Long articleId;
    private final CommentResponse comment;
    
    public CommentUpdatedEvent(Object source, Long articleId, CommentResponse comment) {
        super(source);
        this.articleId = articleId;
        this.comment = comment;
    }
}

