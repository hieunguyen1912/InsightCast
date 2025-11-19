/**
 * useRole Hook
 * Hook để kiểm tra roles của user
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook để kiểm tra roles và permissions của user
 * @param {string|string[]} requiredRoles - Role(s) cần kiểm tra
 * @param {string|string[]} requiredPermissions - Permission(s) cần kiểm tra
 * @returns {Object} Object chứa các helper methods và boolean values
 */
export function useRole(requiredRoles = null, requiredPermissions = null) {
  const { user, isAuthenticated } = useAuth();

  const roles = useMemo(() => {
    if (!user || !user.roles) return [];
    // Hỗ trợ cả array và object roles
    return Array.isArray(user.roles) 
      ? user.roles.map(role => typeof role === 'string' ? role : role.code || role.name)
      : [];
  }, [user]);

  const permissions = useMemo(() => {
    if (!user || !user.roles) return [];
    // Lấy tất cả permissions từ các roles
    const allPermissions = [];
    if (Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            const permCode = typeof permission === 'string' 
              ? permission 
              : permission.code || permission.name;
            if (permCode && !allPermissions.includes(permCode)) {
              allPermissions.push(permCode);
            }
          });
        }
      });
    }
    return allPermissions;
  }, [user]);

  // Kiểm tra user có một trong các roles yêu cầu không
  const hasRole = useMemo(() => {
    if (!requiredRoles) return true;
    if (!isAuthenticated || roles.length === 0) return false;
    
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesToCheck.some(role => roles.includes(role));
  }, [requiredRoles, roles, isAuthenticated]);

  // Kiểm tra user có một trong các permissions yêu cầu không
  const hasPermission = useMemo(() => {
    if (!requiredPermissions) return true;
    if (!isAuthenticated || permissions.length === 0) return false;
    
    const permsToCheck = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    return permsToCheck.some(perm => permissions.includes(perm));
  }, [requiredPermissions, permissions, isAuthenticated]);

  // Kiểm tra user có tất cả roles yêu cầu không
  const hasAllRoles = useMemo(() => {
    if (!requiredRoles) return true;
    if (!isAuthenticated || roles.length === 0) return false;
    
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesToCheck.every(role => roles.includes(role));
  }, [requiredRoles, roles, isAuthenticated]);

  // Kiểm tra user có tất cả permissions yêu cầu không
  const hasAllPermissions = useMemo(() => {
    if (!requiredPermissions) return true;
    if (!isAuthenticated || permissions.length === 0) return false;
    
    const permsToCheck = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    return permsToCheck.every(perm => permissions.includes(perm));
  }, [requiredPermissions, permissions, isAuthenticated]);

  // Kiểm tra user có role ADMIN không
  const isAdmin = useMemo(() => {
    return isAuthenticated && roles.includes('ADMIN');
  }, [roles, isAuthenticated]);

  // Kiểm tra user có role MODERATOR không
  const isModerator = useMemo(() => {
    return isAuthenticated && roles.includes('MODERATOR');
  }, [roles, isAuthenticated]);

  // Kiểm tra user có role USER không (role mặc định)
  const isUser = useMemo(() => {
    return isAuthenticated && (roles.includes('USER') || roles.length === 0);
  }, [roles, isAuthenticated]);

  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    hasAllRoles,
    hasAllPermissions,
    isAdmin,
    isModerator,
    isUser,
    isAuthenticated
  };
}

