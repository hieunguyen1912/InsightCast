package com.hieunguyen.podcastai.dto.request;

import java.time.Instant;

import com.hieunguyen.podcastai.enums.FetchType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FetchConfigurationRequest {
    @NotBlank(message = "News source ID is required")
    private Long newsSourceId;
    @NotBlank(message = "Fetch type is required")
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
