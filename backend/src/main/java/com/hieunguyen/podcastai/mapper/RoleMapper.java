package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoleMapper {
    Role toRole(RoleRequest roleRequest);
    void update(RoleUpdateRequest roleUpdateRequest, @MappingTarget Role role);
    RoleDto toRoleDto(Role role);
}
