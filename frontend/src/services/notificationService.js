/**
 * Notification Service
 * Handles notification-related API operations
 */

import apiClient from './axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const notificationService = {
  /**
   * Get list of notifications with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Field to sort by (default: "createdAt")
   * @param {string} params.sortDirection - Sort direction: "asc" or "desc" (default: "desc")
   * @returns {Promise<Object>} API response with paginated notifications
   */
  async getNotifications(params = {}) {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.NOTIFICATIONS}?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch notifications'
      };
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} API response with unread count
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.NOTIFICATION_UNREAD_COUNT);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch unread count'
      };
    }
  },

  /**
   * Mark a notification as read
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} API response
   */
  async markAsRead(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Notification ID is required'
        };
      }

      const response = await apiClient.put(API_ENDPOINTS.USER.NOTIFICATION_MARK_READ(id));

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to mark notification as read'
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} API response
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER.NOTIFICATION_MARK_ALL_READ);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to mark all notifications as read'
      };
    }
  },

  /**
   * Delete a notification
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} API response
   */
  async deleteNotification(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Notification ID is required'
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.USER.NOTIFICATION_DELETE(id));

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete notification'
      };
    }
  },

  /**
   * Delete all read notifications
   * @returns {Promise<Object>} API response
   */
  async deleteReadNotifications() {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USER.NOTIFICATION_DELETE_READ);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete read notifications'
      };
    }
  }
};

export default notificationService;

