/**
 * News Service - API integration for news content
 * Handles all news-related API calls for HomePage and ArticleDetailPage
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { authService } from '../../features/auth/api';

class NewsService {
  /**
   * Get featured article for hero section
   * @returns {Promise<Object>} Featured article data
   */
  async getFeaturedArticle() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NEWS.FEATURED);
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('Error fetching featured article:', error);
      return null;
    }
  }

  /**
   * Get trending articles for side panel
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of trending articles
   */
  async getTrendingArticles(limit = 4) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NEWS.TRENDING}?limit=${limit}`);
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  /**
   * Get latest articles
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of latest articles
   */
  async getLatestArticles(limit = 4) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NEWS.LATEST}?limit=${limit}`);
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  /**
   * Get article by ID
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Article data
   */
  async getArticleById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NEWS.BY_ID(id));
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track article view
   * @param {number} articleId - Article ID
   * @returns {Promise<Object>} Updated view count
   */
  async trackArticleView(articleId) {
    try {
      // Track view by fetching article (view count is automatically incremented)
      const response = await apiClient.get(API_ENDPOINTS.NEWS.BY_ID(articleId));
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error tracking view for article ${articleId}:`, error);
      // Don't throw error, just log it
      return null;
    }
  }

  /**
   * Get related articles
   * @param {number} id - Article ID
   * @param {number} limit - Number of related articles to fetch
   * @returns {Promise<Array>} Array of related articles
   */
  async getRelatedArticles(id, limit = 4) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NEWS.RELATED(id)}?limit=${limit}`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching related articles for article ${id}:`, error);
      // Fallback to latest articles if related endpoint fails
      return this.getLatestArticles(limit);
    }
  }

  /**
   * Like/Unlike article
   * @param {number} articleId - Article ID
   * @param {boolean} isLiked - Whether to like or unlike
   * @returns {Promise<Object>} Updated like count and status
   */
  async toggleArticleLike(articleId, isLiked) {
    try {
      const method = isLiked ? 'post' : 'delete';
      const response = await apiClient[method](`/news/${articleId}/like`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for article ${articleId}:`, error);
      throw error;
    }
  }

  /**
   * Search articles with filters
   * @param {Object} filters - Search filters
   * @param {string} filters.keyword - Keyword to search
   * @param {number} filters.categoryId - Category ID filter
   * @param {string} filters.fromDate - Start date (ISO string or Instant format)
   * @param {string} filters.toDate - End date (ISO string or Instant format)
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<Object>} PaginatedResponse with content array and pagination metadata
   */
  async searchArticles(filters, page = 0, size = 10) {
    try {
      const params = new URLSearchParams();
      
      // Add optional filter parameters
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      
      // Convert dates to ISO string format for Instant
      if (filters.fromDate) {
        const fromDate = filters.fromDate instanceof Date 
          ? filters.fromDate.toISOString() 
          : new Date(filters.fromDate).toISOString();
        params.append('fromDate', fromDate);
      }
      if (filters.toDate) {
        const toDate = filters.toDate instanceof Date 
          ? filters.toDate.toISOString() 
          : new Date(filters.toDate).toISOString();
        params.append('toDate', toDate);
      }
      
      // Add pagination parameters (Pageable)
      params.append('page', page);
      params.append('size', size);

      const response = await apiClient.get(`${API_ENDPOINTS.NEWS.SEARCH}?${params.toString()}`);
      // Response is PaginatedResponse<NewsArticleResponse>
      // Structure: { content, page, size, totalElements, totalPages, hasNext, hasPrevious, first, last }
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NEWS.CATEGORIES);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Generate audio from article
   * @param {number} articleId - Article ID
   * @param {Object} options - Audio generation options
   * @param {Object} options.customVoiceSettings - Custom voice configuration (optional)
   * @param {string} options.customVoiceSettings.languageCode - Language code (e.g., 'en-US')
   * @param {string} options.customVoiceSettings.voiceName - Google TTS voice name
   * @param {number} options.customVoiceSettings.speakingRate - Speaking rate (0.25 - 4.0)
   * @param {number} options.customVoiceSettings.pitch - Pitch adjustment (-20.0 to 20.0)
   * @param {number} options.customVoiceSettings.volumeGain - Volume gain in dB (-96.0 to 16.0)
   * @param {string} options.customVoiceSettings.audioEncoding - Audio encoding format (default: 'MP3')
   * @param {number} options.customVoiceSettings.sampleRateHertz - Sample rate
   * @param {boolean} options.enableSummarization - Enable article summarization (default: true)
   * @param {boolean} options.enableTranslation - Enable article translation (default: false)
   * @returns {Promise<Object>} Audio generation response with audio file data
   */
  async generateAudio(articleId, options = {}) {
    try {
      const requestBody = {};
      
      // Add custom voice settings if provided
      if (options.customVoiceSettings) {
        requestBody.customVoiceSettings = options.customVoiceSettings;
      }
      
      // Add optional flags (defaults handled by backend)
      if (options.enableSummarization !== undefined) {
        requestBody.enableSummarization = options.enableSummarization;
      }
      
      if (options.enableTranslation !== undefined) {
        requestBody.enableTranslation = options.enableTranslation;
      }

      // Use /articles endpoint for audio generation (MODERATOR role required)
      const response = await apiClient.post(
        API_ENDPOINTS.ARTICLES.GENERATE_AUDIO(articleId),
        Object.keys(requestBody).length > 0 ? requestBody : {}
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Audio generation started successfully'
      };
    } catch (error) {
      console.error(`Error generating audio for article ${articleId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate audio';
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
   * Check audio generation status
   * @param {number} audioFileId - Audio file ID
   * @returns {Promise<Object>} Audio generation status with progress
   */
  async checkAudioStatus(audioFileId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ARTICLES.CHECK_AUDIO_STATUS(audioFileId)
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Audio generation status retrieved'
      };
    } catch (error) {
      console.error(`Error checking audio status for audio file ${audioFileId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check audio status';
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
   * Get audio stream URL using apiClient
   * Fetches audio as blob and creates object URL for <audio> tag
   * @param {number} audioFileId - Audio file ID
   * @returns {Promise<string>} Blob URL for audio streaming
   */
  async getAudioStreamUrl(audioFileId) {
    if (!audioFileId) return null;
    
    try {
      // Use apiClient to fetch audio with all authentication and interceptors
      const response = await apiClient.get(
        API_ENDPOINTS.ARTICLES.STREAM_AUDIO(audioFileId),
        {
          responseType: 'blob' // Important: fetch as blob for audio streaming
        }
      );
      
      // Create object URL from blob for <audio> tag
      const blob = new Blob([response.data], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Error fetching audio stream for audio file ${audioFileId}:`, error);
      return null;
    }
  }

  /**
   * Download audio file
   * Downloads the complete audio file as a byte array
   * @param {number} audioFileId - Audio file ID
   * @returns {Promise<Blob>} Audio file blob for download
   */
  async downloadAudio(audioFileId) {
    if (!audioFileId) {
      throw new Error('Audio file ID is required');
    }

    try {
      // Use apiClient to download audio with all authentication and interceptors
      const response = await apiClient.get(
        API_ENDPOINTS.ARTICLES.DOWNLOAD_AUDIO(audioFileId),
        {
          responseType: 'blob' // Important: fetch as blob for file download
        }
      );

      // Return blob for download
      return response.data;
    } catch (error) {
      console.error(`Error downloading audio file ${audioFileId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download audio';
      const errorCode = error.response?.data?.code || error.response?.status;
      
      throw {
        message: errorMessage,
        code: errorCode,
        status: error.response?.status
      };
    }
  }
}

export default new NewsService();
