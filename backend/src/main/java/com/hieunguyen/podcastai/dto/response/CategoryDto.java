package com.hieunguyen.podcastai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    
    private Long id;
    private String name;
    private String description;
    private String slug;
    private String iconUrl;
    private Integer sortOrder;
    private Long parentCategoryId;
    private String parentCategoryName;
    private Instant createdAt;
    private Instant updatedAt;
}
