package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.FcmTokenRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.service.FcmTokenService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/me/fcm-tokens")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('USER')")
public class FcmTokenController {

    private final FcmTokenService fcmTokenService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> registerToken(
            @Valid @RequestBody FcmTokenRequest request) {
        
        Long userId = securityUtils.getCurrentUserId();
        log.info("Registering FCM token for user ID: {}", userId);
        
        fcmTokenService.saveToken(
            userId,
            request.getToken(),
            request.getDeviceType(),
            request.getDeviceInfo()
        );
        
        log.info("FCM token registered successfully for user ID: {}", userId);
        return ResponseEntity.ok(
            ApiResponse.success("Token registered successfully", null)
        );
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<ApiResponse<Void>> removeToken(
            @PathVariable String token) {
        
        Long userId = securityUtils.getCurrentUserId();
        log.info("Removing FCM token for user ID: {}", userId);
        
        fcmTokenService.removeToken(userId, token);
        
        log.info("FCM token removed successfully for user ID: {}", userId);
        return ResponseEntity.ok(
            ApiResponse.success("Token removed successfully", null)
        );
    }
}
