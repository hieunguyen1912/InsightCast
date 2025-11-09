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
          // Refresh failed, clear auth and redirect to login
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
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
