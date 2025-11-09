package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.response.PermissionDto;
import com.hieunguyen.podcastai.entity.Permission;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.PermissionRepository;
import com.hieunguyen.podcastai.repository.RolePermissionRepository;
import com.hieunguyen.podcastai.service.PermissionService;
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
public class PermissionServiceImpl implements PermissionService {
    
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<PermissionDto> getAllPermissions(Pageable pageable) {
        log.info("Getting all permissions with pagination");
        return permissionRepository.findAll(pageable)
                .map(this::mapToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        log.info("Getting all permissions");
        return permissionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PermissionDto getPermissionById(Long id) {
        log.info("Getting permission by ID: {}", id);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        return mapToDto(permission);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PermissionDto getPermissionByCode(String code) {
        log.info("Getting permission by code: {}", code);
        Permission permission = permissionRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        return mapToDto(permission);
    }
    
    private PermissionDto mapToDto(Permission permission) {
        // Count active roles with this permission
        int rolesCount = rolePermissionRepository.findByPermissionAndIsActiveTrue(permission).size();
        
        return PermissionDto.builder()
                .id(permission.getId())
                .name(permission.getName())
                .code(permission.getCode())
                .description(permission.getDescription())
                .resource(permission.getResource())
                .action(permission.getAction())
                .isActive(permission.getIsActive())
                .rolesCount(rolesCount)
                .build();
    }
}

