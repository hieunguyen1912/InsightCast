package com.hieunguyen.podcastai.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class RoleRequest {
    
    @NotBlank(message = "Role name is required")
    @Size(min = 1, max = 50, message = "Role name must be between 1 and 50 characters")
    private String name;
    
    @NotBlank(message = "Role code is required")
    @Size(min = 1, max = 50, message = "Role code must be between 1 and 50 characters")
    @Pattern(regexp = "^[A-Z_][A-Z0-9_]*$", message = "Role code must be uppercase letters, numbers, and underscores only, starting with a letter or underscore")
    private String code;
    
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
    
    @Builder.Default
    private Boolean isActive = true;
}

