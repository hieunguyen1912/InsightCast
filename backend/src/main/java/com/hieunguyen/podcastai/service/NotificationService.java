package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.response.NotificationDto;
import com.hieunguyen.podcastai.entity.Notification;
import com.hieunguyen.podcastai.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface NotificationService {

    Notification createNotification(Long userId, NotificationType type,
                                    String title, String body, Map<String, Object> data);

    Page<NotificationDto> getUserNotifications(Pageable pageable);

    Long getUnreadCount();

    void markAsRead(Long notificationId);

    void markAllAsRead();

    void deleteNotification(Long notificationId);

    void deleteAllReadNotifications();
}
