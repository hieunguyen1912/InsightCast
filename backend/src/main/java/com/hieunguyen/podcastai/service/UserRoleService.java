package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.UserRoleAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;

import java.util.List;

public interface UserRoleService {
    
    /**
     * Lấy danh sách roles của user
     */
    List<RoleDto> getUserRoles(Long userId);
    
    /**
     * Gán role cho user
     */
    RoleDto assignRoleToUser(Long userId, UserRoleAssignmentRequest request);
    
    /**
     * Gỡ role khỏi user (soft delete)
     */
    void revokeRoleFromUser(Long userId, Long roleId);
}

