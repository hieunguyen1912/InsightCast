/**
 * RBAC Utilities
 * Utility functions để làm việc với roles và permissions
 */

/**
 * Kiểm tra user có một trong các roles yêu cầu không
 * @param {Object} user - User object
 * @param {string|string[]} requiredRoles - Role(s) cần kiểm tra
 * @returns {boolean}
 */
export function hasRole(user, requiredRoles) {
  if (!user || !user.roles) return false;
  
  const userRoles = Array.isArray(user.roles)
    ? user.roles.map(role => typeof role === 'string' ? role : role.code || role.name)
    : [];
  
  if (userRoles.length === 0) return false;
  
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return rolesToCheck.some(role => userRoles.includes(role));
}

/**
 * Kiểm tra user có tất cả các roles yêu cầu không
 * @param {Object} user - User object
 * @param {string|string[]} requiredRoles - Role(s) cần kiểm tra
 * @returns {boolean}
 */
export function hasAllRoles(user, requiredRoles) {
  if (!user || !user.roles) return false;
  
  const userRoles = Array.isArray(user.roles)
    ? user.roles.map(role => typeof role === 'string' ? role : role.code || role.name)
    : [];
  
  if (userRoles.length === 0) return false;
  
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return rolesToCheck.every(role => userRoles.includes(role));
}

/**
 * Lấy tất cả permissions của user từ các roles
 * @param {Object} user - User object
 * @returns {string[]} Array of permission codes
 */
export function getUserPermissions(user) {
  if (!user || !user.roles) return [];
  
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
}

/**
 * Kiểm tra user có một trong các permissions yêu cầu không
 * @param {Object} user - User object
 * @param {string|string[]} requiredPermissions - Permission(s) cần kiểm tra
 * @returns {boolean}
 */
export function hasPermission(user, requiredPermissions) {
  const userPermissions = getUserPermissions(user);
  if (userPermissions.length === 0) return false;
  
  const permsToCheck = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return permsToCheck.some(perm => userPermissions.includes(perm));
}

/**
 * Kiểm tra user có tất cả các permissions yêu cầu không
 * @param {Object} user - User object
 * @param {string|string[]} requiredPermissions - Permission(s) cần kiểm tra
 * @returns {boolean}
 */
export function hasAllPermissions(user, requiredPermissions) {
  const userPermissions = getUserPermissions(user);
  if (userPermissions.length === 0) return false;
  
  const permsToCheck = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return permsToCheck.every(perm => userPermissions.includes(perm));
}

/**
 * Lấy tất cả roles của user
 * @param {Object} user - User object
 * @returns {string[]} Array of role codes
 */
export function getUserRoles(user) {
  if (!user || !user.roles) return [];
  
  return Array.isArray(user.roles)
    ? user.roles.map(role => typeof role === 'string' ? role : role.code || role.name)
    : [];
}

