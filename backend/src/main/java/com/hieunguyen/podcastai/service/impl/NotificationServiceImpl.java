package com.hieunguyen.podcastai.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieunguyen.podcastai.dto.response.NotificationDto;
import com.hieunguyen.podcastai.entity.Notification;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.enums.NotificationType;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.NotificationRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.NotificationService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final SecurityUtils securityUtils;


    @Override
    public Notification createNotification(Long userId, NotificationType type,
                                           String title, String body, Map<String, Object> data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String dataJson = null;
        if (data != null && !data.isEmpty()) {
            try {
                dataJson = objectMapper.writeValueAsString(data);
            } catch (JsonProcessingException e) {
                log.error(e.getMessage());
            }
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .data(dataJson)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Getting notifications for user ID: {}", currentUser.getId());

        Page<Notification> notifications = notificationRepository
                .findByUserOrderByCreatedAtDesc(currentUser, pageable);

        return notifications.map(this::toDto);
    }

    @Override
    public Long getUnreadCount() {
        User currentUser = securityUtils.getCurrentUser();
        long count = notificationRepository.countByUserAndIsReadFalse(currentUser);
        log.debug("Unread count for user ID {}: {}", currentUser.getId(), count);
        return count;
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Marking notification ID: {} as read for user ID: {}", notificationId, currentUser.getId());

        Notification notification = notificationRepository
                .findByIdAndUser(notificationId, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!notification.isRead()) {
            int updated = notificationRepository.markAsRead(notificationId, currentUser, Instant.now());
            if (updated > 0) {
                log.info("Successfully marked notification ID: {} as read", notificationId);
            }
        } else {
            log.debug("Notification ID: {} is already read", notificationId);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = securityUtils.getCurrentUser();
        int updated = notificationRepository.markAllAsRead(user, Instant.now());
        log.info("Successfully marked {} notifications as read", updated);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Deleting notification ID: {} for user ID: {}", notificationId, currentUser.getId());

        Notification notification = notificationRepository
                .findByIdAndUser(notificationId, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        notificationRepository.delete(notification);
        log.info("Successfully deleted notification ID: {}", notificationId);
    }

    @Override
    @Transactional
    public void deleteAllReadNotifications() {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Deleting all read notifications for user ID: {}", currentUser.getId());

        notificationRepository.deleteAllReadNotifications(currentUser);
        log.info("Successfully deleted all read notifications");
    }

    private NotificationDto toDto(Notification notification) {
        Map<String, Object> dataMap = null;

        if (notification.getData() != null && !notification.getData().isEmpty()) {
            try {
                dataMap = objectMapper.readValue(
                        notification.getData(),
                        new TypeReference<>() {
                        }
                );
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse notification data JSON: {}", e.getMessage());
            }
        }

        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .data(notification.getData())
                .dataMap(dataMap)
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}

