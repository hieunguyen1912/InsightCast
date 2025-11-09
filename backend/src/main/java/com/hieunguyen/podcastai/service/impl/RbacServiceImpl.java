package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.entity.Permission;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserRole;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.PermissionRepository;
import com.hieunguyen.podcastai.repository.RolePermissionRepository;
import com.hieunguyen.podcastai.repository.RoleRepository;
import com.hieunguyen.podcastai.repository.UserRoleRepository;
import com.hieunguyen.podcastai.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RbacServiceImpl implements RbacService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<Role> getUserRoles(User user) {
        return userRoleRepository.findActiveRolesByUser(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Permission> getUserPermissions(User user) {
        return rolePermissionRepository.findActivePermissionsByUser(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getUserRoleCodes(User user) {
        return getUserRoles(user).stream()
                .map(Role::getCode)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Set<String> getUserPermissionCodes(User user) {
        return getUserPermissions(user).stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasRole(User user, String roleCode) {
        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return userRoleRepository.existsByUserAndRoleAndIsActiveTrue(user, role);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(User user, String permissionCode) {
        Set<String> userPermissions = getUserPermissionCodes(user);
        return userPermissions.contains(permissionCode);
    }
    
    @Override
    @Transactional
    public UserRole assignRoleToUser(User user, Role role) {
        // Kiểm tra đã có role này chưa
        Optional<UserRole> existingUserRole = userRoleRepository.findByUserAndRole(user, role);
        
        if (existingUserRole.isPresent()) {
            UserRole userRole = existingUserRole.get();
            // Nếu đã tồn tại nhưng inactive, thì activate lại
            if (!userRole.getIsActive()) {
                userRole.setIsActive(true);
                return userRoleRepository.save(userRole);
            }
            // Nếu đã active rồi thì return
            return userRole;
        }
        
        // Tạo mới
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .isActive(true)
                .build();
        
        return userRoleRepository.save(userRole);
    }
    
    @Override
    @Transactional
    public UserRole assignRoleToUserByCode(User user, String roleCode) {
        Role role = getRoleByCode(roleCode);
        return assignRoleToUser(user, role);
    }
    
    @Override
    @Transactional
    public void revokeRoleFromUser(User user, Role role) {
        UserRole userRole = userRoleRepository.findByUserAndRole(user, role)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ROLE_NOT_FOUND));
        
        userRole.setIsActive(false);
        userRoleRepository.save(userRole);
        log.info("Role {} revoked from user {}", role.getCode(), user.getEmail());
    }
    
    @Override
    @Transactional
    public void revokeRoleFromUserByCode(User user, String roleCode) {
        Role role = getRoleByCode(roleCode);
        revokeRoleFromUser(user, role);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Role getRoleByCode(String roleCode) {
        return roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Permission getPermissionByCode(String permissionCode) {
        return permissionRepository.findByCode(permissionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
    }
}

