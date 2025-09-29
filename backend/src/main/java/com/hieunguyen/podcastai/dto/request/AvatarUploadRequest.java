package com.hieunguyen.podcastai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarUploadRequest {
    
    @NotBlank(message = "Avatar URL is required")
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", 
             message = "Avatar URL must be a valid image URL")
    private String avatarUrl;
}
