/**
 * Profile service
 * Handles user profile operations
 */

import apiClient from '../../services/axiosClient';

export const profileService = {
  /**
   * Get user profile
   * @returns {Promise<Object>} API response with profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/user/me');
      
      // Backend response structure: { status, code, message, data, timestamp }
      if (response.data) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid response format from server'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch profile'
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @param {string} profileData.username - User's username (required)
   * @param {string} profileData.email - User's email (required)
   * @param {string} profileData.firstName - User's first name (optional)
   * @param {string} profileData.lastName - User's last name (optional)
   * @param {string} profileData.phoneNumber - User's phone number (optional)
   * @param {string} profileData.dateOfBirth - User's date of birth (optional)
   * @returns {Promise<Object>} API response
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/user/me', profileData);
      
      // Backend response structure: { status, code, message, data, timestamp }
      if (response.data) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid response format from server'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    }
  },

  /**
   * Upload profile avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise<Object>} API response
   */
  async uploadAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await apiClient.post('/user/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid response format from server'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to upload avatar'
      };
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} API response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/user/me/password', passwordData);
      
      if (response.data) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid response format from server'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to change password'
      };
    }
  },

  /**
   * Delete user account
   * @param {string} password - User password for confirmation
   * @returns {Promise<Object>} API response
   */
  async deleteAccount(password) {
    try {
      const response = await apiClient.delete('/user/me', {
        data: { password }
      });
      
      if (response.data) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid response format from server'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete account'
      };
    }
  }
};
