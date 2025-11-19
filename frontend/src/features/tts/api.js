/**
 * TTS Configuration Service
 * Handles all TTS (Text-to-Speech) configuration API calls
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

class TtsConfigService {
  /**
   * Create a new TTS configuration
   * @param {Object} configData - TTS configuration data
   * @param {string} configData.name - Name of the TTS configuration (required, max 100 chars)
   * @param {string} configData.description - Optional description (max 500 chars)
   * @param {string} configData.languageCode - Language and region code (required, format: xx-XX)
   * @param {string} configData.voiceName - Name of the voice to use (required, max 50 chars)
   * @param {number} configData.speakingRate - Speech rate multiplier (required, 0.25 - 4.0)
   * @param {number} configData.pitch - Pitch adjustment in semitones (required, -20.0 - 20.0)
   * @param {number} configData.volumeGain - Volume gain in dB (required, -96.0 - 16.0)
   * @param {string} configData.sampleRateHertz - Sample rate (optional, default: RATE_24000)
   * @returns {Promise<Object>} API response with created TTS configuration
   */
  async createTtsConfig(configData) {
    try {
      // Validate required fields
      if (!configData.name) {
        return {
          success: false,
          error: 'Name is required',
          errorCode: 4000,
          status: 400
        };
      }

      if (!configData.languageCode) {
        return {
          success: false,
          error: 'Language code is required',
          errorCode: 4000,
          status: 400
        };
      }

      if (!configData.voiceName) {
        return {
          success: false,
          error: 'Voice name is required',
          errorCode: 4000,
          status: 400
        };
      }

      if (configData.speakingRate === undefined || configData.speakingRate === null) {
        return {
          success: false,
          error: 'Speaking rate is required',
          errorCode: 4000,
          status: 400
        };
      }

      if (configData.pitch === undefined || configData.pitch === null) {
        return {
          success: false,
          error: 'Pitch is required',
          errorCode: 4000,
          status: 400
        };
      }

      if (configData.volumeGain === undefined || configData.volumeGain === null) {
        return {
          success: false,
          error: 'Volume gain is required',
          errorCode: 4000,
          status: 400
        };
      }

      // Prepare request body
      const requestBody = {
        name: configData.name,
        languageCode: configData.languageCode,
        voiceName: configData.voiceName,
        speakingRate: configData.speakingRate,
        pitch: configData.pitch,
        volumeGain: configData.volumeGain
      };

      // Add optional fields
      if (configData.description !== undefined && configData.description !== null) {
        requestBody.description = configData.description;
      }

      if (configData.sampleRateHertz !== undefined && configData.sampleRateHertz !== null) {
        requestBody.sampleRateHertz = configData.sampleRateHertz;
      }

      const response = await apiClient.post(
        API_ENDPOINTS.TTS_CONFIG.CREATE,
        requestBody
      );

      // axiosClient interceptor already extracts response.data.data to response.data
      const data = response.data;

      return {
        success: true,
        data: data,
        message: 'TTS configuration created successfully'
      };
    } catch (error) {
      // Check if error has success code 2000 (which means success but caught as error)
      if (error.response?.data?.code === 2000 || error.code === 2000 || error.message?.includes('created successfully')) {
        // This is actually a success response
        const responseData = error.response?.data;
        const data = responseData?.data;
        
        return {
          success: true,
          data: data || null,
          message: responseData?.message || error.message || 'TTS configuration created successfully'
        };
      }
      
      // Only log actual errors
      console.error('Error creating TTS configuration:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create TTS configuration';
      const errorCode = error.response?.data?.code || error.response?.status;

      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        status: error.response?.status
      };
    }
  }

  /**
   * Get TTS configuration for the authenticated user
   * Each user has only one TTS configuration
   * @returns {Promise<Object>} TTS configuration data
   */
  async getUserTtsConfig() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TTS_CONFIG.GET_USER);
      
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      
      // axiosClient interceptor already extracts response.data.data to response.data
      // So we use response.data directly
      const data = response.data;
      
      // If data is null or undefined, user doesn't have a config yet
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return {
          success: true,
          data: null,
          message: 'No TTS configuration found'
        };
      }
      
      return {
        success: true,
        data: data,
        message: 'TTS configuration retrieved successfully'
      };
    } catch (error) {
      // Check if error has success code 2000 (which means success but caught as error)
      // This can happen if interceptor rejects a successful response (e.g., status: 0 but code: 2000)
      if (error.response?.data?.code === 2000 || error.code === 2000 || error.message?.includes('retrieved successfully')) {
        // This is actually a success response
        // Interceptor rejected it, so data is still in original structure: {status, code, message, data}
        const responseData = error.response?.data;
        const data = responseData?.data;
        
        return {
          success: true,
          data: data || null,
          message: responseData?.message || error.message || 'TTS configuration retrieved successfully'
        };
      }
      
      // Only log actual errors
      console.error('Error fetching user TTS configuration:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // If 404, user doesn't have a config yet (not an error)
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null,
          message: 'No TTS configuration found'
        };
      }
      
      // Extract error message and code from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch TTS configuration';
      const errorCode = error.response?.data?.code || error.response?.status;
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        status: error.response?.status
      };
    }
  }


  /**
   * Update TTS configuration
   * All fields are optional - only provided fields will be updated (partial update)
   * Users can only update their own configurations
   * @param {number} id - TTS configuration ID
   * @param {Object} configData - Updated TTS configuration data (all fields optional)
   * @param {string} configData.name - Name of the TTS configuration (max 100 chars)
   * @param {string} configData.description - Description (max 500 chars)
   * @param {string} configData.languageCode - Language and region code (format: xx-XX)
   * @param {string} configData.voiceName - Name of the voice to use (max 50 chars)
   * @param {number} configData.speakingRate - Speech rate multiplier (0.25 - 4.0)
   * @param {number} configData.pitch - Pitch adjustment in semitones (-20.0 - 20.0)
   * @param {number} configData.volumeGainDb - Volume gain in dB (-96.0 - 16.0) - Note: use volumeGainDb for update, not volumeGain
   * @param {string} configData.audioEncoding - Audio encoding format (MP3, WAV, LINEAR16, OGG_OPUS, MULAW, ALAW)
   * @param {number} configData.sampleRateHertz - Sample rate in Hz (8000 - 48000) - Note: integer value, not enum string
   * @param {boolean} configData.isDefault - Set as default configuration
   * @param {boolean} configData.isActive - Active status
   * @returns {Promise<Object>} API response with updated TTS configuration
   */
  async updateTtsConfig(id, configData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'TTS configuration ID is required',
          errorCode: 4000,
          status: 400
        };
      }

      // Build request body with only provided fields (partial update)
      const requestBody = {};

      // Only include fields that are explicitly provided (not undefined/null)
      if (configData.name !== undefined && configData.name !== null) {
        requestBody.name = configData.name;
      }
      if (configData.description !== undefined && configData.description !== null) {
        requestBody.description = configData.description;
      }
      if (configData.languageCode !== undefined && configData.languageCode !== null) {
        requestBody.languageCode = configData.languageCode;
      }
      if (configData.voiceName !== undefined && configData.voiceName !== null) {
        requestBody.voiceName = configData.voiceName;
      }
      if (configData.speakingRate !== undefined && configData.speakingRate !== null) {
        requestBody.speakingRate = configData.speakingRate;
      }
      if (configData.pitch !== undefined && configData.pitch !== null) {
        requestBody.pitch = configData.pitch;
      }
      // Note: Update uses volumeGainDb, not volumeGain
      if (configData.volumeGainDb !== undefined && configData.volumeGainDb !== null) {
        requestBody.volumeGainDb = configData.volumeGainDb;
      }
      // Also support volumeGain for backward compatibility, but convert to volumeGainDb
      if (configData.volumeGain !== undefined && configData.volumeGain !== null && configData.volumeGainDb === undefined) {
        requestBody.volumeGainDb = configData.volumeGain;
      }
      if (configData.audioEncoding !== undefined && configData.audioEncoding !== null) {
        requestBody.audioEncoding = configData.audioEncoding;
      }
      if (configData.sampleRateHertz !== undefined && configData.sampleRateHertz !== null) {
        // Ensure it's an integer (not enum string like "RATE_24000")
        requestBody.sampleRateHertz = typeof configData.sampleRateHertz === 'string' 
          ? parseInt(configData.sampleRateHertz.replace('RATE_', ''), 10)
          : configData.sampleRateHertz;
      }
      if (configData.isDefault !== undefined && configData.isDefault !== null) {
        requestBody.isDefault = configData.isDefault;
      }
      if (configData.isActive !== undefined && configData.isActive !== null) {
        requestBody.isActive = configData.isActive;
      }

      // Check if at least one field is provided
      if (Object.keys(requestBody).length === 0) {
        return {
          success: false,
          error: 'At least one field must be provided for update',
          errorCode: 4000,
          status: 400
        };
      }

      const response = await apiClient.put(
        API_ENDPOINTS.TTS_CONFIG.UPDATE(id),
        requestBody
      );

      // axiosClient interceptor already extracts response.data.data to response.data
      const data = response.data;
      
      return {
        success: true,
        data: data,
        message: 'TTS configuration updated successfully'
      };
    } catch (error) {
      // Check if error has success code 2000 (which means success but caught as error)
      if (error.response?.data?.code === 2000 || error.code === 2000 || error.message?.includes('updated successfully')) {
        // This is actually a success response
        const responseData = error.response?.data;
        const data = responseData?.data;
        
        return {
          success: true,
          data: data || null,
          message: responseData?.message || error.message || 'TTS configuration updated successfully'
        };
      }
      
      // Only log actual errors
      console.error(`Error updating TTS configuration ${id}:`, error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Extract error message and code from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update TTS configuration';
      const errorCode = error.response?.data?.code || error.response?.status;
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        status: error.response?.status
      };
    }
  }

  /**
   * Delete TTS configuration
   * Users can only delete their own configurations
   * @param {number} id - TTS configuration ID
   * @returns {Promise<Object>} API response
   */
  async deleteTtsConfig(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'TTS configuration ID is required',
          errorCode: 4000,
          status: 400
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.TTS_CONFIG.DELETE(id));
      
      return {
        success: true,
        message: 'TTS configuration deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting TTS configuration ${id}:`, error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Check if error has success code 2000 (which means success but caught as error)
      if (error.response?.data?.code === 2000 || error.code === 2000 || error.message?.includes('deleted successfully')) {
        // This is actually a success response
        return {
          success: true,
          message: error.response?.data?.message || error.message || 'TTS configuration deleted successfully'
        };
      }
      
      // Extract error message and code from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete TTS configuration';
      const errorCode = error.response?.data?.code || error.response?.status;
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        status: error.response?.status
      };
    }
  }

}

export default new TtsConfigService();

