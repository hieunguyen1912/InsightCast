package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.RolePermissionRepository;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.repository.UserRoleRepository;
import com.hieunguyen.podcastai.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {
    
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<RoleDto> getAllRoles(Pageable pageable) {
        log.info("Getting all roles with pagination");
        return roleRepository.findAll(pageable)
                .map(this::mapToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        log.info("Getting all roles");
        return roleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleById(Long id) {
        log.info("Getting role by ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return mapToDto(role);
    }
    
    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleByCode(String code) {
        log.info("Getting role by code: {}", code);
        Role role = roleRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return mapToDto(role);
    }
    
    @Override
    @Transactional
    public RoleDto createRole(RoleRequest request) {
        log.info("Creating new role with code: {}", request.getCode());
        
        // Check if role code already exists
        if (roleRepository.existsByCode(request.getCode())) {
            log.warn("Role code already exists: {}", request.getCode());
            throw new AppException(ErrorCode.ROLE_NAME_EXISTS);
        }
        
        // Check if role name already exists
        if (roleRepository.existsByName(request.getName())) {
            log.warn("Role name already exists: {}", request.getName());
            throw new AppException(ErrorCode.ROLE_NAME_EXISTS);
        }
        
        Role role = Role.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully with ID: {}", savedRole.getId());
        
        return mapToDto(savedRole);
    }
    
    @Override
    @Transactional
    public RoleDto updateRole(Long id, RoleUpdateRequest request) {
        log.info("Updating role with ID: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        // Check if new name conflicts with existing role
        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByName(request.getName())) {
                log.warn("Role name already exists: {}", request.getName());
                throw new AppException(ErrorCode.ROLE_NAME_EXISTS);
            }
            role.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        
        if (request.getIsActive() != null) {
            role.setIsActive(request.getIsActive());
        }
        
        Role updatedRole = roleRepository.save(role);
        log.info("Role updated successfully with ID: {}", updatedRole.getId());
        
        return mapToDto(updatedRole);
    }
    
    @Override
    @Transactional
    public void deleteRole(Long id) {
        log.info("Deleting (soft delete) role with ID: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        // Soft delete by setting isActive = false
        role.setIsActive(false);
        roleRepository.save(role);
        
        log.info("Role deleted successfully (soft delete) with ID: {}", id);
    }
    
    @Override
    @Transactional
    public RoleDto activateRole(Long id) {
        log.info("Activating role with ID: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        role.setIsActive(true);
        Role activatedRole = roleRepository.save(role);
        
        log.info("Role activated successfully with ID: {}", id);
        return mapToDto(activatedRole);
    }
    
    private RoleDto mapToDto(Role role) {
        // Count active permissions
        int permissionsCount = rolePermissionRepository.findByRoleAndIsActiveTrue(role).size();
        
        // Count active users with this role
        int usersCount = userRoleRepository.findByRoleAndIsActiveTrue(role).size();
        
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .createdBy(role.getCreatedBy())
                .updatedBy(role.getUpdatedBy())
                .permissionsCount(permissionsCount)
                .usersCount(usersCount)
                .build();
    }
}

