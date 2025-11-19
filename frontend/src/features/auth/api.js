import apiClient from '../../services/axiosClient';
class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'accessToken';
  }

  setToken(token, expiresIn) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  getToken() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      return token || null;
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  }

  clearToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token from localStorage:', error);
    }
  }
}

const tokenManager = new TokenManager();

export const authService = {
 
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      if (response.data && response.data.tokens && response.data.user) {
        const { user, tokens, requiresEmailVerification } = response.data;
        
        if (tokens.accessToken) {
          tokenManager.setToken(tokens.accessToken, tokens.expiresIn);
        }
        
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

  async register({ email, password, username, confirmPassword }) {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        username,
        confirmPassword
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
      // Don't clear auth here - let axiosClient interceptor handle it
      // This prevents double clearing and allows proper queue handling
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


  getToken() {
    return tokenManager.getToken();
  },


  setUser(user) {
    localStorage.setItem('userData', JSON.stringify(user));
  },

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
