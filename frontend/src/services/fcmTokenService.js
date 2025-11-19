/**
 * FCM Token Service
 * Handles registration and removal of FCM tokens for push notifications
 */

import apiClient from './axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { getFcmToken } from '../config/firebase-config';


function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Detect device type
  let deviceType = 'WEB';
  if (/Android/i.test(userAgent)) {
    deviceType = 'ANDROID';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = 'IOS';
  }
  
  // Get browser info
  let browser = 'Unknown';
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
  
  return {
    deviceType,
    deviceInfo: `${browser} on ${platform}`
  };
}

const fcmTokenService = {

  async registerToken(token = null, options = {}) {
    try {
      let fcmToken = token;
      if (!fcmToken) {
        console.log('Getting FCM token from Firebase...');
        fcmToken = await getFcmToken();
        if (!fcmToken) {
          console.error('Failed to get FCM token from Firebase');
          return {
            success: false,
            error: 'Failed to get FCM token. Please ensure notification permission is granted.'
          };
        }
        console.log('FCM token retrieved from Firebase');
      }

      // Get device info
      const deviceInfo = getDeviceInfo();
      
      const payload = {
        token: fcmToken,
        deviceType: options.deviceType || deviceInfo.deviceType,
        deviceInfo: options.deviceInfo || deviceInfo.deviceInfo
      };

      console.log('Registering FCM token with server...', {
        deviceType: payload.deviceType,
        deviceInfo: payload.deviceInfo,
        tokenLength: fcmToken.length
      });

      const response = await apiClient.post(API_ENDPOINTS.USER.REGISTER_FCM_TOKEN, payload);
      
      // Store token in localStorage for later use when removing
      this.storeToken(fcmToken);
      
      console.log('FCM token registered successfully with server');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error registering FCM token:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to register FCM token'
      };
    }
  },

  async removeToken(token = null) {
    try {
      let fcmToken = token;
      
      if (!fcmToken) {
        fcmToken = this.getStoredToken();
      }
      
      if (!fcmToken) {
        return {
          success: true,
          data: { message: 'No token to remove' }
        };
      }

      const encodedToken = encodeURIComponent(fcmToken);
      const response = await apiClient.delete(API_ENDPOINTS.USER.REMOVE_FCM_TOKEN(encodedToken));
      
      this.clearStoredToken();
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error removing FCM token:', error);
      
      this.clearStoredToken();
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: { message: 'Token already removed' }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to remove FCM token'
      };
    }
  },

   
  getStoredToken() {
    try {
      return localStorage.getItem('fcmToken');
    } catch (error) {
      console.error('Error reading FCM token from localStorage:', error);
      return null;
    }
  },

  storeToken(token) {
    try {
      localStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Error storing FCM token to localStorage:', error);
    }
  },

  clearStoredToken() {
    try {
      localStorage.removeItem('fcmToken');
    } catch (error) {
      console.error('Error clearing FCM token from localStorage:', error);
    }
  }
};

export default fcmTokenService;

