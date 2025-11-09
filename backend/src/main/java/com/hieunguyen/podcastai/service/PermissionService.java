package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.RolePermissionAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.PermissionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PermissionService {
    
    Page<PermissionDto> getAllPermissions(Pageable pageable);
    
    List<PermissionDto> getAllPermissions();
    
    PermissionDto getPermissionById(Long id);

    List<PermissionDto> getRolePermissions(Long roleId);

    PermissionDto assignPermissionToRole(Long roleId, RolePermissionAssignmentRequest request);

    void revokePermissionFromRole(Long roleId, Long permissionId);
}

