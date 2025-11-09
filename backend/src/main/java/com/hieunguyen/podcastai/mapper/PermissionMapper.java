package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.PermissionDto;
import com.hieunguyen.podcastai.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PermissionMapper {
    PermissionDto toDto(Permission permission);
}
