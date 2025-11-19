package com.hieunguyen.podcastai.listener;

import com.hieunguyen.podcastai.dto.request.FcmNotificationRequest;
import com.hieunguyen.podcastai.entity.Notification;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.base.BaseEntity;

import com.hieunguyen.podcastai.enums.NotificationType;
import com.hieunguyen.podcastai.event.ArticleApprovedEvent;
import com.hieunguyen.podcastai.event.ArticleRejectedEvent;
import com.hieunguyen.podcastai.event.ArticleSubmittedEvent;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.FcmService;
import com.hieunguyen.podcastai.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final FcmService fcmService;
    private final UserRepository userRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleArticleRejected(ArticleRejectedEvent event) {
        Map<String, Object> data = new HashMap<>();
        data.put("articleId", event.getArticleId());
        data.put("articleTitle", event.getArticleTitle());
        data.put("rejectionReason", event.getRejectionReason());

        Notification notification = notificationService.createNotification(
                event.getAuthorId(),
                NotificationType.ARTICLE_REJECTED,
                "Article Rejected",
                String.format("Your article '%s' was rejected. Reason: %s",
                        event.getArticleTitle(),
                        event.getRejectionReason()),
                data
        );

        log.info("Created notification ID: {} for user ID: {}",
                notification.getId(), event.getAuthorId());

        FcmNotificationRequest fcmRequest = FcmNotificationRequest.builder()
                .title("Article Rejected")
                .body(String.format("Your article '%s' was rejected", event.getArticleTitle()))
                .data(Map.of(
                        "type", "ARTICLE_REJECTED",
                        "notificationId", String.valueOf(notification.getId()),
                        "articleId", String.valueOf(event.getArticleId())
                ))
                .build();

        fcmService.sendNotificationToUser(event.getAuthorId(), fcmRequest);
        log.info("Sent FCM notification to user ID: {}", event.getAuthorId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleArticlesubmitted(ArticleSubmittedEvent event) {
        List<Long> adminUserIds = getAdminUserIds();

        if (adminUserIds.isEmpty()) {
            log.warn("No admin users found to notify about article submission");
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("articleId", event.getArticleId());
        data.put("articleTitle", event.getArticleTitle());
        data.put("authorId", event.getAuthorId());
        data.put("authorName", event.getAuthorName());

        String notificationTitle = "New Article Submitted for Review";
        String notificationBody = String.format("'%s' by %s is waiting for review",
                event.getArticleTitle(), event.getAuthorName());

        for (Long adminId : adminUserIds) {
            Notification notification = notificationService.createNotification(
                    adminId,
                    NotificationType.ARTICLE_SUBMITTED,
                    notificationTitle,
                    notificationBody,
                    data
            );

            log.info("Created notification ID: {} for admin ID: {}",
                    notification.getId(), adminId);
        }

        FcmNotificationRequest fcmRequest = FcmNotificationRequest.builder()
                .title(notificationTitle)
                .body(notificationBody)
                .data(Map.of(
                        "type", "ARTICLE_SUBMITTED",
                        "articleId", String.valueOf(event.getArticleId())
                ))
                .build();
        fcmService.sendNotificationToMultipleUsers(adminUserIds, fcmRequest);

        log.info("Sent FCM notifications to {} admin users", adminUserIds.size());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleArticleApproved(ArticleApprovedEvent event) {
        Map<String, Object> data = new HashMap<>();
        data.put("articleId", event.getArticleId());
        data.put("articleTitle", event.getArticleTitle());

        String notificationTitle = "Article Approved";
        String notificationBody = String.format("Your article '%s' has been approved and published!",
                event.getArticleTitle());

        Notification notification = notificationService.createNotification(
                event.getAuthorId(),
                NotificationType.ARTICLE_APPROVED,
                notificationTitle,
                notificationBody,
                data
        );

        log.info("Created notification ID: {} for author ID: {}",
                notification.getId(), event.getAuthorId());

        FcmNotificationRequest fcmRequest = FcmNotificationRequest.builder()
                .title(notificationTitle)
                .body(notificationBody)
                .data(Map.of(
                        "type", "ARTICLE_APPROVED",
                        "notificationId", String.valueOf(notification.getId()),
                        "articleId", String.valueOf(event.getArticleId())
                ))
                .build();

        fcmService.sendNotificationToUser(event.getAuthorId(), fcmRequest);
    }

    private List<Long> getAdminUserIds() {
        List<User> users = userRepository.findUsersByRole("ADMIN");

        return users.stream().map(BaseEntity::getId).toList();
    }
}
