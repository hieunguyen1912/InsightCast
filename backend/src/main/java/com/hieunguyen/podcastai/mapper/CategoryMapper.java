package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.CategoryRequest;
import com.hieunguyen.podcastai.dto.request.CategoryUpdateRequest;
import com.hieunguyen.podcastai.dto.response.CategoryDto;
import com.hieunguyen.podcastai.entity.Category;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CategoryMapper {

    Category toEntity(CategoryRequest request);

    @Mapping(target = "children", ignore = true)
    @Mapping(target = "parentCategoryId", source = "parent.id")
    @Mapping(target = "parentCategoryName", source = "parent.name")
    CategoryDto toDto(Category category);

    List<CategoryDto> toDtoList(List<Category> categories);

    void updateEntity(CategoryUpdateRequest request, @MappingTarget Category category);
}