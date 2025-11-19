package com.hieunguyen.podcastai.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FcmTokenRequest {
    
    @NotBlank(message = "Token is required")
    @Size(max = 500, message = "Token must not exceed 500 characters")
    private String token;
    
    @Size(max = 50, message = "Device type must not exceed 50 characters")
    private String deviceType; // "WEB", "ANDROID", "IOS"
    
    @Size(max = 500, message = "Device info must not exceed 500 characters")
    private String deviceInfo; // Browser name, OS, etc.
}

