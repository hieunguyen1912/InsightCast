package com.hieunguyen.podcastai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class FcmNotificationRequest {
    private String title;
    private String body;
    private Map<String, String> data;
}
