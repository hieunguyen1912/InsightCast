package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.RolePermissionAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.PermissionDto;
import com.hieunguyen.podcastai.entity.Permission;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.PermissionMapper;
import com.hieunguyen.podcastai.repository.PermissionRepository;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionServiceImpl implements PermissionService {
    
    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;
    private final RoleRepository roleRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<PermissionDto> getAllPermissions(Pageable pageable) {
        log.info("Getting all permissions with pagination");
        return permissionRepository.findAll(pageable)
                .map(permissionMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        log.info("Getting all permissions");
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toDto)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public PermissionDto getPermissionById(Long id) {
        log.info("Getting permission by ID: {}", id);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        return permissionMapper.toDto(permission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getRolePermissions(Long roleId) {
        log.info("Getting permissions for role ID: {}", roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return role.getPermissions().stream()
                .map(permissionMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public PermissionDto assignPermissionToRole(Long roleId, RolePermissionAssignmentRequest request) {
        log.info("Assigning permission ID {} to role ID {}", request.getPermissionId(), roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        Permission permission = permissionRepository.findById(request.getPermissionId())
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        if (Boolean.FALSE.equals(role.getIsActive())) {
            log.warn("Cannot assign permission to inactive role {}", role.getCode());
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        if (Boolean.FALSE.equals(permission.getIsActive())) {
            log.warn("Cannot assign inactive permission {} to role {}", permission.getCode(), role.getCode());
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        role.getPermissions().add(permission);

        roleRepository.save(role);

        log.info("Successfully assigned permission {} to role {}", permission.getCode(), role.getCode());

        return permissionMapper.toDto(permission);
    }

    @Override
    @Transactional
    public void revokePermissionFromRole(Long roleId, Long permissionId) {
        log.info("Revoking permission ID {} from role ID {}", permissionId, roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        role.getPermissions().remove(permission);

        roleRepository.save(role);

        log.info("Successfully revoked permission {} from role {}", permission.getCode(), role.getCode());
    }
}

