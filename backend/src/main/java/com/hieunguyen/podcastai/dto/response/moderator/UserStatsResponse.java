package com.hieunguyen.podcastai.dto.response.moderator;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hieunguyen.podcastai.enums.UserStatus;
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
public class UserStatsResponse {
    private Map<UserStatus, Long> usersByStatus;
    private Long totalUsers;
    private Long newUsersToday;
    private Long newUsersThisWeek;
    private Long newUsersThisMonth;
}

