package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.UserRoleAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserRole;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.repository.UserRoleRepository;
import com.hieunguyen.podcastai.service.RbacService;
import com.hieunguyen.podcastai.service.UserRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRoleServiceImpl implements UserRoleService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RbacService rbacService;
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getUserRoles(Long userId) {
        log.info("Getting roles for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<Role> roles = rbacService.getUserRoles(user);
        
        return roles.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public RoleDto assignRoleToUser(Long userId, UserRoleAssignmentRequest request) {
        log.info("Assigning role ID {} to user ID {}", request.getRoleId(), userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        // Check if role is active
        if (!role.getIsActive()) {
            log.warn("Cannot assign inactive role {} to user {}", role.getCode(), user.getEmail());
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        
        // Check if user already has this role
        java.util.Optional<UserRole> existingUserRole = userRoleRepository.findByUserAndRole(user, role);
        
        if (existingUserRole.isPresent()) {
            UserRole userRole = existingUserRole.get();
            if (userRole.getIsActive()) {
                log.info("User {} already has role {}, returning existing assignment", user.getEmail(), role.getCode());
                return mapToDto(role);
            } else {
                // Reactivate the existing role assignment
                userRole.setIsActive(true);
                userRoleRepository.save(userRole);
                log.info("Reactivated role {} for user {}", role.getCode(), user.getEmail());
                return mapToDto(role);
            }
        }
        
        // Create new role assignment
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .isActive(true)
                .build();
        
        userRoleRepository.save(userRole);
        log.info("Successfully assigned role {} to user {}", role.getCode(), user.getEmail());
        
        return mapToDto(role);
    }
    
    @Override
    @Transactional
    public void revokeRoleFromUser(Long userId, Long roleId) {
        log.info("Revoking role ID {} from user ID {}", roleId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        UserRole userRole = userRoleRepository.findByUserAndRole(user, role)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ROLE_NOT_FOUND));
        
        // Soft delete by setting isActive = false
        userRole.setIsActive(false);
        userRoleRepository.save(userRole);
        
        log.info("Successfully revoked role {} from user {}", role.getCode(), user.getEmail());
    }
    
    private RoleDto mapToDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .build();
    }
}

