package com.hieunguyen.podcastai.service.impl;

import com.google.firebase.messaging.*;
import com.hieunguyen.podcastai.dto.request.FcmNotificationRequest;
import com.hieunguyen.podcastai.service.FcmService;
import com.hieunguyen.podcastai.service.FcmTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmServiceImpl implements FcmService {

    private static final int MAX_TOKENS_PER_BATCH = 500;
    private final FirebaseMessaging firebaseMessaging;
    private final FcmTokenService fcmTokenService;

    @Override
    public void sendNotification(String token, FcmNotificationRequest request) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(request.getTitle())
                            .setBody(request.getBody())
                            .build())
                    .putAllData(request.getData() != null ?
                            request.getData() : java.util.Collections.emptyMap())
                    .build();

            String response = firebaseMessaging.send(message);
            log.info("Successfully sent FCM message: {}", response);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM message to token {}: {}", token, e.getMessage(), e);

            if (e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT ||
                    e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                log.warn("Removing invalid token: {}", token);
                fcmTokenService.removeTokenByToken(token);
            }
            throw new RuntimeException("Failed to send FCM notification", e);
        }
    }

    @Override
    public void sendNotificationToUser(Long userId, FcmNotificationRequest request) {
        List<String> tokens = fcmTokenService.getUserTokens(userId);

        if (tokens.isEmpty()) {
            log.warn("No FCM tokens found for user ID: {}", userId);
            return;
        }

        sendNotificationToTokens(tokens, request);
    }

    @Override
    public void sendNotificationToMultipleUsers(List<Long> userIds, FcmNotificationRequest request) {
        Set<String> allTokens = new HashSet<>();
        for (Long userId : userIds) {
            allTokens.addAll(fcmTokenService.getUserTokens(userId));
        }

        if (allTokens.isEmpty()) {
            log.warn("No FCM tokens found for users: {}", userIds);
            return;
        }

        // Sử dụng MulticastMessage
        sendNotificationToTokens(new ArrayList<>(allTokens), request);
    }

    private void sendNotificationToTokens(List<String> tokens, FcmNotificationRequest request) {
        if (tokens.isEmpty()) {
            return;
        }

        for (int i = 0; i < tokens.size(); i += MAX_TOKENS_PER_BATCH) {
            int end = Math.min(i + MAX_TOKENS_PER_BATCH, tokens.size());
            List<String> batch = tokens.subList(i, end);

            try {
                MulticastMessage multicastMessage = MulticastMessage.builder()
                        .addAllTokens(batch)
                        .setNotification(Notification.builder()
                                .setTitle(request.getTitle())
                                .setBody(request.getBody())
                                .build())
                        .putAllData(request.getData() != null ?
                                request.getData() : java.util.Collections.emptyMap())
                        .build();

                BatchResponse response = firebaseMessaging.sendEachForMulticast(multicastMessage);

                log.info("Successfully sent {} messages, {} failed", response.getSuccessCount(), response.getFailureCount());

                if (response.getFailureCount() > 0) {
                    List<SendResponse> responses = response.getResponses();
                    List<String> invalidTokens = new ArrayList<>();

                    for (int j = 0; j < responses.size(); j++) {
                        SendResponse sendResponse = responses.get(j);
                        if (!sendResponse.isSuccessful()) {
                            String token = batch.get(j);
                            FirebaseMessagingException exception = sendResponse.getException();

                            if (exception == null) {
                               continue;
                            }
                            MessagingErrorCode errorCode = exception.getMessagingErrorCode();
                            if (errorCode == MessagingErrorCode.INVALID_ARGUMENT ||
                                    errorCode == MessagingErrorCode.UNREGISTERED ||
                                    errorCode == MessagingErrorCode.SENDER_ID_MISMATCH) {
                                invalidTokens.add(token);
                                log.warn("Invalid token detected: {}", token);
                            }
                        }
                    }

                    if (!invalidTokens.isEmpty()) {
                        log.info("Removing {} invalid tokens", invalidTokens.size());
                        fcmTokenService.removeTokensByTokens(invalidTokens);
                    }
                }
            } catch (FirebaseMessagingException e) {
                log.error("Failed to send multicast message: {}", e.getMessage(), e);
                log.error("Error code: {}, Error details: {}", 
                    e.getMessagingErrorCode(), e.getCause());
            } catch (Exception e) {
                log.error("Unexpected error sending multicast message: {}", e.getMessage(), e);
            }
        }
    }
}
