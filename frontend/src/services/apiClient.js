/**
 * Centralized API client configuration
 * Handles base URL, headers, interceptors, and common request/response logic
 */

import axios from 'axios';
import { authService } from './authService';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor for authentication and common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from memory if available
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and common processing
apiClient.interceptors.response.use(
  (response) => {
    // Log request duration in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    // Handle ApiResponse wrapper structure
    // Backend returns: { status, code, message, data, timestamp }
    if (response.data && typeof response.data === 'object') {
      // If the response has the ApiResponse structure, extract the data
      if ('data' in response.data && 'status' in response.data) {
        // Check if the API call was successful based on status
        if (response.data.status >= 200 && response.data.status < 300) {
          // Success - return the wrapped data
          response.data = response.data.data;
        } else {
          // API returned error status - create error
          const error = new Error(response.data.message || 'API request failed');
          error.response = {
            ...response,
            data: response.data,
            status: response.data.status
          };
          return Promise.reject(error);
        }
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token (refreshToken is sent via cookies)
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success) {
          // Retry original request with new token
          const newToken = authService.getToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // Refresh failed or no token available - redirect to login
      authService.clearAuth();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error occurred');
    }
    
    // Handle ApiResponse wrapper in error responses
    if (error.response?.data && typeof error.response.data === 'object') {
      if ('message' in error.response.data && 'status' in error.response.data) {
        // Extract error message from ApiResponse wrapper
        error.message = error.response.data.message;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
