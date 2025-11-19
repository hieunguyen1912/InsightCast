import axios from 'axios';
import { authService } from '../features/auth/api';
import { navigationService } from './navigationService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const isRefreshEndpoint = config.url?.includes('/auth/refresh');

    if (!isRefreshEndpoint) {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/news/search',
  '/news/featured',
  '/news/trending',
  '/news/latest',
  '/news/categories',
  '/news/category'
];

// Check if an endpoint is public (allows access without auth)
const isPublicEndpoint = (url) => {
  if (!url) return false;
  // Extract path without query parameters
  const path = url.split('?')[0];
  // Remove base URL prefix if present (e.g., /api/v1)
  // Note: axios config.url is relative to baseURL, so it should already be without /api/v1
  const cleanPath = path.replace(/^\/api\/v1/, '') || path;
  
  // Check if URL matches any public endpoint pattern
  // Check exact matches or starts with for endpoints like /news/{id}
  return PUBLIC_ENDPOINTS.some(endpoint => cleanPath === endpoint || cleanPath.startsWith(endpoint + '/')) ||
         /^\/news\/\d+$/.test(cleanPath) || // /news/{id}
         /^\/news\/\d+\/related/.test(cleanPath) || // /news/{id}/related
         /^\/news\/category\/\d+/.test(cleanPath); // /news/category/{id}
};

apiClient.interceptors.response.use(
  (response) => {
    const backendStatus = response.data?.status;
    
    if (backendStatus !== undefined) {
      if (backendStatus >= 200 && backendStatus < 300) {
        response.data = response.data.data;
        return response;
      } else {
        const error = new Error(response.data.message || 'Request failed');
        error.response = response;
        error.response.status = backendStatus;
        error.config = response.config;
        return Promise.reject(error);
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401 || 
                          (error.response?.data?.status === 401);
    
    if (isUnauthorized && originalRequest) {
      const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
      const isPublic = isPublicEndpoint(originalRequest.url);
      
      if (isRefreshEndpoint) {
        isRefreshing = false;
        failedQueue = [];
        
        authService.clearAuth();
        
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          navigationService.replace('/login');
        }
        
        return Promise.reject(error);
      }

      // For public endpoints, if we get 401, try retrying without auth headers
      if (isPublic && !originalRequest._retryWithoutAuth) {
        originalRequest._retryWithoutAuth = true;
        // Remove Authorization header and retry
        const retryConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: undefined
          },
          _retry: true
        };
        delete retryConfig.headers.Authorization;
        return apiClient(retryConfig);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            const retryConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`
              },
              _retry: true
            };
            return apiClient(retryConfig);
          })
          .catch(err => {
            // For public endpoints, if refresh fails, try without auth
            if (isPublic && !originalRequest._retryWithoutAuth) {
              originalRequest._retryWithoutAuth = true;
              const retryConfig = {
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: undefined
                },
                _retry: true
              };
              delete retryConfig.headers.Authorization;
              return apiClient(retryConfig);
            }
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success && refreshResult.data?.accessToken) {
          const newToken = refreshResult.data.accessToken;
          
          processQueue(null, newToken);
          isRefreshing = false;
          
          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`
            },
            _retry: true
          };
          
          // Retry the original request with new token
          return apiClient(retryConfig);
        } else {
          // Refresh failed
          // For public endpoints, try without auth instead of redirecting
          if (isPublic && !originalRequest._retryWithoutAuth) {
            processQueue(null, null);
            isRefreshing = false;
            originalRequest._retryWithoutAuth = true;
            const retryConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: undefined
              },
              _retry: true
            };
            delete retryConfig.headers.Authorization;
            return apiClient(retryConfig);
          }
          // For protected endpoints, clear auth and redirect to login
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // For public endpoints, try without auth instead of redirecting
        if (isPublic && !originalRequest._retryWithoutAuth) {
          processQueue(null, null);
          isRefreshing = false;
          originalRequest._retryWithoutAuth = true;
          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: undefined
            },
            _retry: true
          };
          delete retryConfig.headers.Authorization;
          return apiClient(retryConfig);
        }
        
        // For protected endpoints, clear auth and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        authService.clearAuth();
        
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          navigationService.replace('/login');
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
