package com.hieunguyen.podcastai.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
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
public class UpdateArticleRequest {
    
    @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
    private String title;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(min = 100, message = "Content must be at least 100 characters")
    private String content;
    
    private Long categoryId;
    
    private String featuredImage;
    
    @Size(max = 2000, message = "Summary must not exceed 2000 characters")
    private String summary;
}

