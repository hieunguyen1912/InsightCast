package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDto {
    
    private Long id;
    private String name;
    private String description;
    private String slug;
    private Boolean isActive;
    private String icon;
    private String color;
    private Integer displayOrder;
    private Long parentCategoryId;
    private String parentCategoryName;
    private List<CategoryDto> children;
}