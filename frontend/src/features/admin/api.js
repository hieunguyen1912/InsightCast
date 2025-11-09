/**
 * Admin Service - API integration for admin operations
 * Handles all admin-related API calls including:
 * - Article approval/rejection
 * - User management
 * - Role and permission management
 * - Categories management (admin-level)
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

const adminService = {
  async getPendingArticles(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'updatedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ADMIN.PENDING_ARTICLES}?${queryString}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching pending articles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch pending articles',
        data: { content: [], totalElements: 0 }
      };
    }
  },

  /**
   * Approve an article
   * @param {string|number} id - Article ID
   * @returns {Promise<Object>} API response
   */
  async approveArticle(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      const response = await apiClient.post(API_ENDPOINTS.ADMIN.APPROVE_ARTICLE(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error approving article:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to approve article'
      };
    }
  },

  /**
   * Reject an article
   * @param {string|number} id - Article ID
   * @param {string} rejectionReason - Rejection reason (required, 10-1000 characters)
   * @returns {Promise<Object>} API response
   */
  async rejectArticle(id, rejectionReason) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      if (!rejectionReason || rejectionReason.trim().length < 10) {
        return {
          success: false,
          error: 'Rejection reason must be at least 10 characters'
        };
      }

      if (rejectionReason.length > 1000) {
        return {
          success: false,
          error: 'Rejection reason must not exceed 1000 characters'
        };
      }

      const payload = {
        rejectionReason: rejectionReason.trim()
      };
      
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REJECT_ARTICLE(id), payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error rejecting article:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed. Rejection reason must be between 10 and 1000 characters.';
        return {
          success: false,
          error: errorMessage
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to reject article'
      };
    }
  },


  async getUsers(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc'
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ADMIN.USERS}?${queryString}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch users',
        data: { content: [], totalElements: 0, totalPages: 0 }
      };
    }
  },

  async getUserById(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch user'
      };
    }
  },

  async updateUser(id, userData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Prepare payload (only include defined fields)
      const payload = {};

      if (userData.username !== undefined && userData.username !== null) {
        if (userData.username.length < 3 || userData.username.length > 50) {
          return {
            success: false,
            error: 'Username must be between 3 and 50 characters'
          };
        }
        // Validate username pattern: alphanumeric and underscore only
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        if (!usernamePattern.test(userData.username)) {
          return {
            success: false,
            error: 'Username can only contain letters, numbers, and underscores'
          };
        }
        payload.username = userData.username.trim();
      }

      if (userData.email !== undefined && userData.email !== null) {
        if (userData.email.length > 100) {
          return {
            success: false,
            error: 'Email must not exceed 100 characters'
          };
        }
        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userData.email)) {
          return {
            success: false,
            error: 'Email must be a valid email address'
          };
        }
        payload.email = userData.email.trim();
      }

      if (userData.firstName !== undefined && userData.firstName !== null) {
        if (userData.firstName.length > 50) {
          return {
            success: false,
            error: 'First name must not exceed 50 characters'
          };
        }
        payload.firstName = userData.firstName.trim() || null;
      }

      if (userData.lastName !== undefined && userData.lastName !== null) {
        if (userData.lastName.length > 50) {
          return {
            success: false,
            error: 'Last name must not exceed 50 characters'
          };
        }
        payload.lastName = userData.lastName.trim() || null;
      }

      if (userData.phoneNumber !== undefined && userData.phoneNumber !== null) {
        if (userData.phoneNumber.length > 20) {
          return {
            success: false,
            error: 'Phone number must not exceed 20 characters'
          };
        }
        payload.phoneNumber = userData.phoneNumber.trim() || null;
      }

      if (userData.dateOfBirth !== undefined && userData.dateOfBirth !== null) {
        // Validate date format: yyyy-MM-dd
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (userData.dateOfBirth && !datePattern.test(userData.dateOfBirth)) {
          return {
            success: false,
            error: 'Date of birth must be in format yyyy-MM-dd'
          };
        }
        payload.dateOfBirth = userData.dateOfBirth || null;
      }

      if (userData.avatarUrl !== undefined && userData.avatarUrl !== null) {
        payload.avatarUrl = userData.avatarUrl.trim() || null;
      }

      const response = await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_USER(id), payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Validation failed'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.message || 'Username or email already exists'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update user'
      };
    }
  },

 
  async updateUserStatus(id, status) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      if (!status) {
        return {
          success: false,
          error: 'Status is required'
        };
      }

      // Validate status values
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return {
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        };
      }

      const response = await apiClient.put(
        API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(id),
        { status: status.toUpperCase() }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Status is required or invalid'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update user status'
      };
    }
  },

  
  async deleteUser(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete user'
      };
    }
  },

  /**
   * Get user roles
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async getUserRoles(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_ROLES(userId));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch user roles',
        data: []
      };
    }
  },

  /**
   * Assign role to user
   * @param {string|number} userId - User ID
   * @param {string|number} roleId - Role ID
   * @returns {Promise<Object>} API response
   */
  async assignRoleToUser(userId, roleId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      if (!roleId) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ASSIGN_USER_ROLE(userId),
        { roleId }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to assign role'
      };
    }
  },

  /**
   * Revoke role from user
   * @param {string|number} userId - User ID
   * @param {string|number} roleId - Role ID
   * @returns {Promise<Object>} API response
   */
  async revokeRoleFromUser(userId, roleId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      if (!roleId) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.delete(
        API_ENDPOINTS.ADMIN.REVOKE_USER_ROLE(userId, roleId)
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error revoking role from user:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to revoke role'
      };
    }
  },

  /**
   * Update user roles (assign/revoke multiple roles)
   * This function will sync the roles by:
   * 1. Getting current roles
   * 2. Assigning new roles that are not in current list
   * 3. Revoking roles that are in current list but not in new list
   * @param {string|number} userId - User ID
   * @param {Array} roleIds - Array of role IDs
   * @returns {Promise<Object>} API response
   */
  async updateUserRoles(userId, roleIds) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get current roles
      const currentRolesResult = await this.getUserRoles(userId);
      if (!currentRolesResult.success) {
        return {
          success: false,
          error: 'Failed to fetch current user roles'
        };
      }

      const currentRolesData = currentRolesResult.data?.data || currentRolesResult.data || [];
      const currentRoleIds = Array.isArray(currentRolesData)
        ? currentRolesData.map(r => r.id || r)
        : [];

      const newRoleIds = Array.isArray(roleIds) ? roleIds : [];
      
      // Find roles to assign (in new list but not in current)
      const toAssign = newRoleIds.filter(id => !currentRoleIds.includes(id));
      
      // Find roles to revoke (in current list but not in new)
      const toRevoke = currentRoleIds.filter(id => !newRoleIds.includes(id));

      // Assign new roles
      const assignResults = await Promise.all(
        toAssign.map(roleId => this.assignRoleToUser(userId, roleId))
      );

      // Revoke removed roles
      const revokeResults = await Promise.all(
        toRevoke.map(roleId => this.revokeRoleFromUser(userId, roleId))
      );

      // Check if all operations succeeded
      const allAssignSuccess = assignResults.every(r => r.success);
      const allRevokeSuccess = revokeResults.every(r => r.success);

      if (allAssignSuccess && allRevokeSuccess) {
        return {
          success: true,
          data: { message: 'User roles updated successfully' }
        };
      } else {
        return {
          success: false,
          error: 'Some roles failed to update'
        };
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update user roles'
      };
    }
  },

  // ========== Role Management ==========

  /**
   * Get all roles (paginated)
   * @param {Object} params - Query parameters (page, size, sortBy, sortDirection)
   * @returns {Promise<Object>} API response
   */
  async getRoles(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'name',
        sortDirection: params.sortDirection || 'asc'
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ADMIN.ROLES}?${queryString}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch roles',
        data: { content: [], totalElements: 0 }
      };
    }
  },

  /**
   * Get all roles (non-paginated list)
   * @returns {Promise<Object>} API response
   */
  async getAllRoles() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ROLES_ALL);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching all roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch roles',
        data: []
      };
    }
  },

  /**
   * Get role by ID
   * @param {string|number} id - Role ID
   * @returns {Promise<Object>} API response
   */
  async getRoleById(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ROLE_BY_ID(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching role:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch role'
      };
    }
  },

  /**
   * Get role by code
   * @param {string} code - Role code (e.g., ADMIN, USER)
   * @returns {Promise<Object>} API response
   */
  async getRoleByCode(code) {
    try {
      if (!code) {
        return {
          success: false,
          error: 'Role code is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ROLE_BY_CODE(code));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching role by code:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch role'
      };
    }
  },

  /**
   * Create role
   * @param {Object} roleData - Role data
   * @param {string} roleData.name - Role name (required, 1-50 characters)
   * @param {string} roleData.code - Role code (required, 1-50 characters, uppercase, pattern: ^[A-Z_][A-Z0-9_]*$)
   * @param {string} roleData.description - Description (optional, max 255 characters)
   * @param {boolean} roleData.isActive - Is active (optional, default: true)
   * @returns {Promise<Object>} API response
   */
  async createRole(roleData) {
    try {
      // Validate required fields
      if (!roleData.name || roleData.name.trim().length === 0) {
        return {
          success: false,
          error: 'Role name is required'
        };
      }

      if (roleData.name.length > 50) {
        return {
          success: false,
          error: 'Role name must not exceed 50 characters'
        };
      }

      if (!roleData.code || roleData.code.trim().length === 0) {
        return {
          success: false,
          error: 'Role code is required'
        };
      }

      if (roleData.code.length > 50) {
        return {
          success: false,
          error: 'Role code must not exceed 50 characters'
        };
      }

      // Validate code pattern: ^[A-Z_][A-Z0-9_]*$
      const codePattern = /^[A-Z_][A-Z0-9_]*$/;
      if (!codePattern.test(roleData.code)) {
        return {
          success: false,
          error: 'Role code must contain only uppercase letters, numbers, and underscores, and must start with a letter or underscore'
        };
      }

      // Prepare payload
      const payload = {
        name: roleData.name.trim(),
        code: roleData.code.trim().toUpperCase()
      };

      if (roleData.description !== undefined && roleData.description !== null) {
        if (roleData.description.length > 255) {
          return {
            success: false,
            error: 'Description must not exceed 255 characters'
          };
        }
        payload.description = roleData.description.trim() || null;
      }

      if (roleData.isActive !== undefined && roleData.isActive !== null) {
        payload.isActive = Boolean(roleData.isActive);
      }

      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_ROLE, payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating role:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Validation failed'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create role'
      };
    }
  },

  /**
   * Update role
   * @param {string|number} id - Role ID
   * @param {Object} roleData - Role data (code cannot be updated)
   * @param {string} roleData.name - Role name (optional, 1-50 characters)
   * @param {string} roleData.description - Description (optional, max 255 characters)
   * @param {boolean} roleData.isActive - Is active (optional)
   * @returns {Promise<Object>} API response
   */
  async updateRole(id, roleData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      // Prepare payload (code cannot be updated)
      const payload = {};

      if (roleData.name !== undefined && roleData.name !== null) {
        if (roleData.name.trim().length === 0) {
          return {
            success: false,
            error: 'Role name cannot be empty'
          };
        }
        if (roleData.name.length > 50) {
          return {
            success: false,
            error: 'Role name must not exceed 50 characters'
          };
        }
        payload.name = roleData.name.trim();
      }

      if (roleData.description !== undefined && roleData.description !== null) {
        if (roleData.description.length > 255) {
          return {
            success: false,
            error: 'Description must not exceed 255 characters'
          };
        }
        payload.description = roleData.description.trim() || null;
      }

      if (roleData.isActive !== undefined && roleData.isActive !== null) {
        payload.isActive = Boolean(roleData.isActive);
      }

      const response = await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_ROLE(id), payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating role:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Validation failed'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to update this role'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update role'
      };
    }
  },

  /**
   * Activate role
   * @param {string|number} id - Role ID
   * @returns {Promise<Object>} API response
   */
  async activateRole(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.put(API_ENDPOINTS.ADMIN.ACTIVATE_ROLE(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error activating role:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to activate role'
      };
    }
  },

  /**
   * Delete role
   * @param {string|number} id - Role ID
   * @returns {Promise<Object>} API response
   */
  async deleteRole(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_ROLE(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting role:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete role'
      };
    }
  },

  // ========== Permission Management ==========

  /**
   * Get all permissions (paginated)
   * @param {Object} params - Query parameters (page, size, sortBy, sortDirection)
   * @returns {Promise<Object>} API response
   */
  async getPermissions(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'code',
        sortDirection: params.sortDirection || 'asc'
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ADMIN.PERMISSIONS}?${queryString}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch permissions',
        data: { content: [], totalElements: 0 }
      };
    }
  },

  /**
   * Get all permissions (non-paginated list)
   * @returns {Promise<Object>} API response
   */
  async getAllPermissions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.PERMISSIONS_ALL);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch permissions',
        data: []
      };
    }
  },

  /**
   * Get permission by ID
   * @param {string|number} id - Permission ID
   * @returns {Promise<Object>} API response
   */
  async getPermissionById(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Permission ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.PERMISSION_BY_ID(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching permission:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch permission'
      };
    }
  },

  /**
   * Get role permissions
   * @param {string|number} id - Role ID
   * @returns {Promise<Object>} API response
   */
  async getRolePermissions(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ROLE_PERMISSIONS(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch role permissions'
      };
    }
  },

  /**
   * Assign permission to role
   * @param {string|number} roleId - Role ID
   * @param {string|number} permissionId - Permission ID
   * @returns {Promise<Object>} API response
   */
  async assignPermissionToRole(roleId, permissionId) {
    try {
      if (!roleId) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      if (!permissionId) {
        return {
          success: false,
          error: 'Permission ID is required'
        };
      }

      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ASSIGN_PERMISSION(roleId),
        { permissionId }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to assign permission'
      };
    }
  },

  /**
   * Revoke permission from role
   * @param {string|number} roleId - Role ID
   * @param {string|number} permissionId - Permission ID
   * @returns {Promise<Object>} API response
   */
  async revokePermissionFromRole(roleId, permissionId) {
    try {
      if (!roleId) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      if (!permissionId) {
        return {
          success: false,
          error: 'Permission ID is required'
        };
      }

      const response = await apiClient.delete(
        API_ENDPOINTS.ADMIN.REVOKE_PERMISSION(roleId, permissionId)
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error revoking permission from role:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to revoke permission'
      };
    }
  },

  /**
   * Update role permissions (assign/revoke multiple permissions)
   * This function will sync the permissions by:
   * 1. Getting current permissions
   * 2. Assigning new permissions that are not in current list
   * 3. Revoking permissions that are in current list but not in new list
   * @param {string|number} id - Role ID
   * @param {Array} permissionIds - Array of permission IDs
   * @returns {Promise<Object>} API response
   */
  async updateRolePermissions(id, permissionIds) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Role ID is required'
        };
      }

      // Get current permissions
      const currentPermissionsResult = await this.getRolePermissions(id);
      if (!currentPermissionsResult.success) {
        return {
          success: false,
          error: 'Failed to fetch current permissions'
        };
      }

      const currentPermData = currentPermissionsResult.data?.data || currentPermissionsResult.data || [];
      const currentPermissionIds = Array.isArray(currentPermData)
        ? currentPermData.map(p => p.id || p)
        : [];

      const newPermissionIds = Array.isArray(permissionIds) ? permissionIds : [];
      
      // Find permissions to assign (in new list but not in current)
      const toAssign = newPermissionIds.filter(id => !currentPermissionIds.includes(id));
      
      // Find permissions to revoke (in current list but not in new)
      const toRevoke = currentPermissionIds.filter(id => !newPermissionIds.includes(id));

      // Assign new permissions
      const assignResults = await Promise.all(
        toAssign.map(permissionId => this.assignPermissionToRole(id, permissionId))
      );

      // Revoke removed permissions
      const revokeResults = await Promise.all(
        toRevoke.map(permissionId => this.revokePermissionFromRole(id, permissionId))
      );

      // Check if all operations succeeded
      const allAssignSuccess = assignResults.every(r => r.success);
      const allRevokeSuccess = revokeResults.every(r => r.success);

      if (allAssignSuccess && allRevokeSuccess) {
        return {
          success: true,
          data: { message: 'Permissions updated successfully' }
        };
      } else {
        return {
          success: false,
          error: 'Some permissions failed to update'
        };
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update role permissions'
      };
    }
  },

  // ========== Statistics ==========

  /**
   * Get admin statistics
   * @returns {Promise<Object>} API response
   */
  async getStats() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.STATS);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch statistics',
        data: {}
      };
    }
  }
};

export default adminService;

