package com.hieunguyen.podcastai.dto.response;

import java.time.Instant;

import com.google.auto.value.AutoValue.Builder;
import com.hieunguyen.podcastai.enums.FetchType;

import com.hieunguyen.podcastai.enums.SupportedCountry;
import com.hieunguyen.podcastai.enums.SupportedLanguage;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
public class FetchConfigurationDto {
    private String sourceName;
    private FetchType fetchType;
    private Boolean enabled;
    private String keywords;
    private SupportedLanguage languages;
    private SupportedCountry countries;
    private String categoryName;
    private Integer maxResults;
    private String sortBy;
    private Instant from;
    private Instant to;
}
