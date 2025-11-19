package com.hieunguyen.podcastai.dto.response.moderator;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PendingReviewStatsResponse {
    private Long totalPending;
    private Long pendingOlderThan24Hours;
    private Long pendingOlderThan48Hours;
}

