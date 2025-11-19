package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.NotificationDto;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.service.NotificationService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/me/notifications")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('USER')")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy danh sách notifications của user hiện tại
     * GET /api/v1/user/me/notifications
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationDto>>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Getting notifications - page: {}, size: {}", page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<NotificationDto> notifications = notificationService.getUserNotifications(pageable);
        PaginatedResponse<NotificationDto> response = PaginationHelper.toPaginatedResponse(notifications);

        return ResponseEntity.ok(
            ApiResponse.success("Notifications retrieved successfully", response)
        );
    }

    /**
     * Đếm số notifications chưa đọc
     * GET /api/v1/user/me/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        log.info("Getting unread notification count");

        Long count = notificationService.getUnreadCount();

        return ResponseEntity.ok(
            ApiResponse.success("Unread count retrieved successfully", count)
        );
    }

    /**
     * Đánh dấu notification đã đọc
     * PUT /api/v1/user/me/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        log.info("Marking notification ID: {} as read", id);

        notificationService.markAsRead(id);

        return ResponseEntity.ok(
            ApiResponse.success("Notification marked as read", null)
        );
    }

    /**
     * Đánh dấu tất cả notifications đã đọc
     * PUT /api/v1/user/me/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        log.info("Marking all notifications as read");

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
            ApiResponse.success("All notifications marked as read", null)
        );
    }

    /**
     * Xóa một notification
     * DELETE /api/v1/user/me/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        log.info("Deleting notification ID: {}", id);

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
            ApiResponse.success("Notification deleted successfully", null)
        );
    }

    /**
     * Xóa tất cả notifications đã đọc
     * DELETE /api/v1/user/me/notifications/read
     */
    @DeleteMapping("/read")
    public ResponseEntity<ApiResponse<Void>> deleteAllReadNotifications() {
        log.info("Deleting all read notifications");

        notificationService.deleteAllReadNotifications();

        return ResponseEntity.ok(
            ApiResponse.success("All read notifications deleted successfully", null)
        );
    }
}
