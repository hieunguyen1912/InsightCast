package com.hieunguyen.podcastai.dto.response;

import java.time.Instant;

import com.google.auto.value.AutoValue.Builder;
import com.hieunguyen.podcastai.enums.FetchType;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
public class FetchConfigurationDto {
    private Long newsSourceId;
    private FetchType fetchType;
    private Boolean enabled;
    private String keywords;
    private String languages;
    private String countries;
    private Long categoryId;
    private Integer maxResults;
    private String sortBy;
    private Instant from;
    private Instant to;
}
