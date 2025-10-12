package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TokenDto {
    
    private String accessToken;
    private String refreshToken; // For internal use only, not sent to client
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;
    private Instant expiresAt;
}
