package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.UserRoleAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;

import java.util.List;

public interface UserRoleService {

    List<RoleDto> getUserRoles(Long userId);

    RoleDto assignRoleToUser(Long userId, UserRoleAssignmentRequest request);

    void revokeRoleFromUser(Long userId, Long roleId);

}

