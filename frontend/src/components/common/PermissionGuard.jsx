/**
 * PermissionGuard Component
 * Component để hiển thị/ẩn UI elements dựa trên roles và permissions
 */

import React from 'react';
import { useRole } from '../../hooks/useRole';

/**
 * Component wrapper để hiển thị/ẩn children dựa trên roles/permissions
 * @param {React.ReactNode} children - Component con cần hiển thị
 * @param {string|string[]} requiredRoles - Role(s) yêu cầu để hiển thị
 * @param {string|string[]} requiredPermissions - Permission(s) yêu cầu để hiển thị
 * @param {boolean} requireAll - Nếu true, yêu cầu tất cả roles/permissions, nếu false chỉ cần một (mặc định: false)
 * @param {React.ReactNode} fallback - Component hiển thị khi không có quyền (mặc định: null)
 */
function PermissionGuard({ 
  children, 
  requiredRoles = null,
  requiredPermissions = null,
  requireAll = false,
  fallback = null
}) {
  const { 
    hasRole, 
    hasPermission, 
    hasAllRoles, 
    hasAllPermissions 
  } = useRole(requiredRoles, requiredPermissions);

  // Nếu không yêu cầu gì, hiển thị children
  if (!requiredRoles && !requiredPermissions) {
    return children;
  }

  // Kiểm tra roles
  let hasRequiredAccess = true;
  
  if (requiredRoles) {
    hasRequiredAccess = requireAll ? hasAllRoles : hasRole;
  }
  
  // Kiểm tra permissions (chỉ kiểm tra nếu đã pass role check)
  if (hasRequiredAccess && requiredPermissions) {
    hasRequiredAccess = requireAll ? hasAllPermissions : hasPermission;
  }

  // Hiển thị children nếu có quyền, ngược lại hiển thị fallback
  return hasRequiredAccess ? children : fallback;
}

export default PermissionGuard;

