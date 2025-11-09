package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.UserRoleAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.RoleMapper;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
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
    private final RoleMapper mapper;
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getUserRoles(Long userId) {
        log.info("Getting roles for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<Role> roles = user.getRoles().stream()
                .filter(role -> Boolean.TRUE.equals(role.getIsActive()))
                .collect(Collectors.toList());

        return roles.stream().map(mapper::toRoleDto).toList();
    }
    
    @Override
    @Transactional
    public RoleDto assignRoleToUser(Long userId, UserRoleAssignmentRequest request) {
        log.info("Assigning role ID {} to user ID {}", request.getRoleId(), userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        if (Boolean.FALSE.equals(role.getIsActive())) {
            log.warn("Cannot assign inactive role {} to user {}", role.getCode(), user.getEmail());
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        
        // Check if user already has this role
        if (user.getRoles().contains(role)) {
            log.info("User {} already has role {}, returning existing assignment", user.getEmail(), role.getCode());
            return mapper.toRoleDto(role);
        }
        
        // Add role to user
        user.getRoles().add(role);
        userRepository.save(user);
        log.info("Successfully assigned role {} to user {}", role.getCode(), user.getEmail());
        
        return mapper.toRoleDto(role);
    }
    
    @Override
    @Transactional
    public void revokeRoleFromUser(Long userId, Long roleId) {
        log.info("Revoking role ID {} from user ID {}", roleId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        if (!user.getRoles().contains(role)) {
            throw new AppException(ErrorCode.USER_ROLE_NOT_FOUND);
        }
        
        user.getRoles().remove(role);
        userRepository.save(user);
        
        log.info("Successfully revoked role {} from user {}", role.getCode(), user.getEmail());
    }

}

