import apiClient from './apiClient';

// Token manager class for secure memory storage
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  setToken(token, expiresIn) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
  }

  getToken() {
    if (!this.accessToken || Date.now() > this.tokenExpiry) {
      return null;
    }
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  isTokenValid() {
    return this.accessToken && Date.now() <= this.tokenExpiry;
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export const authService = {
  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} API response with user data and token
   */
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      // Backend response structure: { status, code, message, data, timestamp }
      // data contains: { user, tokens, requiresEmailVerification }
      if (response.data && response.data.tokens && response.data.user) {
        const { user, tokens, requiresEmailVerification } = response.data;
        
        // Store access token in memory (secure)
        if (tokens.accessToken) {
          tokenManager.setToken(tokens.accessToken, tokens.expiresIn);
        }
        
        // Store user data in localStorage (less sensitive)
        this.setUser(user);
        
        return {
          data: {
            user,
            tokens,
            requiresEmailVerification
          },
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
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  },

  /**
   * User registration
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Promise<Object>} API response
   */
  async register({ email, password, name }) {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  /**
   * User logout
   * @returns {Promise<Object>} API response
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      this.clearAuth();
      return {
        data: null,
        success: true
      };
    } catch (error) {
      // Clear auth even if API call fails
      this.clearAuth();
      return {
        data: null,
        success: true
      };
    }
  },

  /**
   * Refresh authentication token
   * RefreshToken is automatically sent via cookies by the browser
   * @returns {Promise<Object>} API response with new token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      
      if (response.data && response.data.accessToken) {
        const { accessToken, expiresIn } = response.data;
        
        if (accessToken) {
          tokenManager.setToken(accessToken, expiresIn);
        }
        
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: 'Invalid refresh response format'
      };
    } catch (error) {
      this.clearAuth();
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || error.message || 'Token refresh failed'
      };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} API response with user data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/user/me');
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} API response
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/user/me', profileData);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  /**
   * Get authentication token from memory
   * @returns {string|null} JWT token or null
   */
  getToken() {
    return tokenManager.getToken();
  },

  /**
   * Check if token is valid
   * @returns {boolean} Token validity
   */
  isTokenValid() {
    return tokenManager.isTokenValid();
  },

  /**
   * Set user data
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem('userData', JSON.stringify(user));
  },

  /**
   * Get user data
   * @returns {Object|null} User data or null
   */
  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },


  isAuthenticated() {
    return !!this.getToken();
  },

  clearAuth() {
    tokenManager.clearToken();
    
    localStorage.removeItem('userData');
  },

  setToken(token, expiresIn) {
    tokenManager.setToken(token, expiresIn);
  },
};
