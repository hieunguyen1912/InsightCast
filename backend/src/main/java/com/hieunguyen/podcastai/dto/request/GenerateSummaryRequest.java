package com.hieunguyen.podcastai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSummaryRequest {

    @NotBlank(message = "Content is required")
    private String content;
    
    @Builder.Default
    private Integer maxLength = 200; // Default200 words 
    
    @Builder.Default
    private String language = "vi"; // Default Vietnamese
}

