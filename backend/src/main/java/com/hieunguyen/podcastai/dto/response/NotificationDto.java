package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hieunguyen.podcastai.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String body;
    private String data;
    private Map<String, Object> dataMap;
    private Boolean isRead;
    private Instant createdAt;
    private Instant updatedAt;
}