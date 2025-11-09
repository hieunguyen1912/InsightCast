package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.RoleMapper;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {
    
    private final RoleRepository roleRepository;
    private final RoleMapper mapper;
    
    @Override
    @Transactional(readOnly = true)
    public Page<RoleDto> getAllRoles(Pageable pageable) {
        log.info("Getting all roles with pagination");
        return roleRepository.findAll(pageable).map(mapper::toRoleDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        log.info("Getting all roles");
        return roleRepository.findAll().stream()
                .map(mapper::toRoleDto)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleById(Long id) {
        log.info("Getting role by ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return mapper.toRoleDto(role);
    }
    
    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleByCode(String code) {
        log.info("Getting role by code: {}", code);
        Role role = roleRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return mapper.toRoleDto(role);
    }
    
    @Override
    @Transactional
    public RoleDto createRole(RoleRequest request) {
        log.info("Creating new role with code: {}", request.getCode());
        
        if (roleRepository.existsByCode(request.getCode())) {
            log.warn("Role code already exists: {}", request.getCode());
            throw new AppException(ErrorCode.ROLE_NAME_EXISTS);
        }
        
        if (roleRepository.existsByName(request.getName())) {
            log.warn("Role name already exists: {}", request.getName());
            throw new AppException(ErrorCode.ROLE_NAME_EXISTS);
        }
        
        Role role = mapper.toRole(request);
        
        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully with ID: {}", savedRole.getId());
        
        return mapper.toRoleDto(savedRole);
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
        
        return mapper.toRoleDto(updatedRole);
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
        return mapper.toRoleDto(activatedRole);
    }
}

