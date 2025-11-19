/**
 * RoleProtectedRoute Component
 * Component để bảo vệ routes theo roles và permissions
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';

/**
 * Component bảo vệ route theo role/permission
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {string|string[]} requiredRoles - Role(s) yêu cầu để truy cập
 * @param {string|string[]} requiredPermissions - Permission(s) yêu cầu để truy cập
 * @param {string} redirectTo - Route redirect khi không có quyền (mặc định: '/')
 * @param {boolean} requireAll - Nếu true, yêu cầu tất cả roles/permissions, nếu false chỉ cần một (mặc định: false)
 */
function RoleProtectedRoute({ 
  children, 
  requiredRoles = null,
  requiredPermissions = null,
  redirectTo = '/',
  requireAll = false
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    hasRole, 
    hasPermission, 
    hasAllRoles, 
    hasAllPermissions 
  } = useRole(requiredRoles, requiredPermissions);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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

  // Redirect nếu không có quyền
  if (!hasRequiredAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children nếu có quyền
  return children;
}

export default RoleProtectedRoute;

