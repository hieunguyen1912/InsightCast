/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../features/auth/api';
import fcmTokenService from '../services/fcmTokenService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresEmailVerification: false
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresEmailVerification: action.payload.requiresEmailVerification || false
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresEmailVerification: false
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {        
        const existingToken = authService.getToken();
        
        if (!existingToken) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }

        const profileResult = await authService.getProfile();
        
        if (profileResult?.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: profileResult.data }
          });
          
          // Register FCM token after successful authentication
          registerFcmTokenSilently();
        } else {
          authService.clearAuth();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuth();
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Register FCM token silently (without blocking UI)
  const registerFcmTokenSilently = async () => {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('Browser does not support notifications, skipping FCM token registration');
        return;
      }

      // Request permission if not already granted/denied
      if (Notification.permission === 'default') {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission not granted:', permission);
          return;
        }
        console.log('Notification permission granted');
      } else if (Notification.permission === 'denied') {
        console.log('Notification permission is denied, skipping FCM token registration');
        return;
      }

      // Permission is granted, register token
      const result = await fcmTokenService.registerToken();
      if (result.success) {
        console.log('✅ FCM token registered successfully');
      } else {
        console.warn('❌ Failed to register FCM token:', result.error);
      }
    } catch (error) {
      console.error('❌ Error registering FCM token:', error);
      // Don't throw - this is a background operation
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        console.log('Login successful, user data:', result.data.user);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { 
            user: result.data.user,
            requiresEmailVerification: result.data.requiresEmailVerification
          }
        });
        
        // Register FCM token after successful login
        registerFcmTokenSilently();
        
        return { 
          success: true,
          requiresEmailVerification: result.data.requiresEmailVerification
        };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: result.error }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        // Auto-login after successful registration
        return await login({
          email: userData.email,
          password: userData.password
        });
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: result.error }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during registration';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove FCM token before logout
      // Get fresh token from Firebase (not from localStorage) to ensure we remove the correct token
      // Backend is the source of truth, but we need the current token to remove it
      try {
        await fcmTokenService.removeToken(); // Will get fresh token from Firebase
      } catch (error) {
        console.warn('Failed to remove FCM token on logout:', error);
        // Continue with logout even if token removal fails
      }
      
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        // Use the user data from response (includes updated version from backend)
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: result.data
        });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    requiresEmailVerification: state.requiresEmailVerification,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
