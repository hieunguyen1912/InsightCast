package com.hieunguyen.podcastai.listener;

import com.hieunguyen.podcastai.event.CommentCreatedEvent;
import com.hieunguyen.podcastai.event.CommentDeletedEvent;
import com.hieunguyen.podcastai.event.CommentUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommentEventListener {
    
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleCommentCreated(CommentCreatedEvent event) {
        String topic = "/topic/comments/" + event.getArticleId();
        Map<String, Object> message = new HashMap<>();
        
        if (event.getComment().getParentId() != null) {
            message.put("action", "reply_created");
            message.put("parentCommentId", event.getComment().getParentId());
        } else {
            message.put("action", "created");
        }
        message.put("comment", event.getComment());
        
        messagingTemplate.convertAndSend(topic, message);
        log.info("Broadcasted comment created event (commentId: {}) to topic: {}", 
                event.getComment().getId(), topic);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleCommentUpdated(CommentUpdatedEvent event) {
        String topic = "/topic/comments/" + event.getArticleId();
        Map<String, Object> message = new HashMap<>();
        message.put("action", "updated");
        message.put("comment", event.getComment());
        
        messagingTemplate.convertAndSend(topic, message);
        log.info("Broadcasted comment updated event (commentId: {}) to topic: {}", 
                event.getComment().getId(), topic);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleCommentDeleted(CommentDeletedEvent event) {
        String topic = "/topic/comments/" + event.getArticleId();
        Map<String, Object> message = new HashMap<>();
        message.put("action", "deleted");
        message.put("commentId", event.getCommentId());
        
        messagingTemplate.convertAndSend(topic, message);
        log.info("Broadcasted comment deleted event (commentId: {}) to topic: {}", 
                event.getCommentId(), topic);
    }
}

