package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.entity.Permission;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserRole;

import java.util.List;
import java.util.Set;

public interface RbacService {
    
    /**
     * Lấy tất cả roles đang active của user
     */
    List<Role> getUserRoles(User user);
    
    /**
     * Lấy tất cả permissions đang active của user (từ tất cả roles)
     */
    List<Permission> getUserPermissions(User user);
    
    /**
     * Lấy role codes của user (ví dụ: ["USER", "MODERATOR"])
     */
    List<String> getUserRoleCodes(User user);
    
    /**
     * Lấy permission codes của user (ví dụ: ["ARTICLE_CREATE", "ARTICLE_READ"])
     */
    Set<String> getUserPermissionCodes(User user);
    
    /**
     * Kiểm tra user có role cụ thể không
     */
    boolean hasRole(User user, String roleCode);
    
    /**
     * Kiểm tra user có permission cụ thể không
     */
    boolean hasPermission(User user, String permissionCode);
    
    /**
     * Gán role cho user
     */
    UserRole assignRoleToUser(User user, Role role);
    
    /**
     * Gán role cho user bằng role code
     */
    UserRole assignRoleToUserByCode(User user, String roleCode);
    
    /**
     * Gỡ role khỏi user (set isActive = false)
     */
    void revokeRoleFromUser(User user, Role role);
    
    /**
     * Gỡ role khỏi user bằng role code
     */
    void revokeRoleFromUserByCode(User user, String roleCode);
    
    /**
     * Lấy role theo code
     */
    Role getRoleByCode(String roleCode);
    
    /**
     * Lấy permission theo code
     */
    Permission getPermissionByCode(String permissionCode);
}

