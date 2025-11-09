package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoleService {

    Page<RoleDto> getAllRoles(Pageable pageable);

    List<RoleDto> getAllRoles();

    RoleDto getRoleById(Long id);

    RoleDto getRoleByCode(String code);

    RoleDto createRole(RoleRequest request);

    RoleDto updateRole(Long id, RoleUpdateRequest request);

    void deleteRole(Long id);

    RoleDto activateRole(Long id);
}

