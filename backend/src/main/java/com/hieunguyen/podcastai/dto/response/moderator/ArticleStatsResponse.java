package com.hieunguyen.podcastai.dto.response.moderator;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hieunguyen.podcastai.enums.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ArticleStatsResponse {
    private Map<ArticleStatus, Long> articlesByStatus;
    private Long totalArticles;
    private Long approvedToday;
    private Long rejectedToday;
    private Long submittedToday;
    private Double approvalRate;
    private Map<String, Long> articlesByCategory;
}

