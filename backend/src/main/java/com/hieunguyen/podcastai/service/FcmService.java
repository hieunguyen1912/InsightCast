package com.hieunguyen.podcastai.service;

import java.util.List;

import com.hieunguyen.podcastai.dto.request.FcmNotificationRequest;

public interface FcmService {

    void sendNotification(String token, FcmNotificationRequest request);

    void sendNotificationToUser(Long userId, FcmNotificationRequest request);
    void sendNotificationToMultipleUsers(List<Long> userIds, FcmNotificationRequest request);
}
