package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.CategoryDto;
import com.hieunguyen.podcastai.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentCategoryId", source = "parentCategory.id")
    @Mapping(target = "parentCategoryName", source = "parentCategory.name")
    CategoryDto toDto(Category category);
}
