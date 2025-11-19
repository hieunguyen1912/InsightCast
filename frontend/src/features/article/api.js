/**
 * News Service - API integration for news content
 * Handles all news-related API calls for HomePage and ArticleDetailPage
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { authService } from '../../features/auth/api';

class NewsService {

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
   * Get articles by category ID
   * @param {number} categoryId - Category ID
   * @param {number} limit - Number of articles to fetch (default: 4)
   * @returns {Promise<Array>} Array of articles
   */
  async getArticlesByCategory(categoryId, limit = 4) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NEWS.BY_CATEGORY(categoryId)}?page=0&size=${limit}&sortBy=publishedAt&sortDirection=desc`);
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      // Handle paginated response
      if (data && data.content) {
        return Array.isArray(data.content) ? data.content : [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching articles for category ${categoryId}:`, error);
      return [];
    }
  }
  
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

  async getArticleAudioFiles(articleId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ARTICLES.GET_AUDIO_FILES(articleId));
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching audio files for article ${articleId}:`, error);
      return [];
    }
  }

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
   * Generate audio from article summary
   * Available to all users (not just authors)
   * @param {number} articleId - Article ID
   * @param {Object} options - Generation options
   * @param {Object} options.customVoiceSettings - Custom voice settings (optional)
   * @returns {Promise<Object>} Audio generation result
   */
  async generateAudioFromSummary(articleId, options = {}) {
    try {
      const requestBody = {};
      
      // Add custom voice settings if provided
      if (options.customVoiceSettings) {
        requestBody.customVoiceSettings = options.customVoiceSettings;
      }

      // Use /articles endpoint for audio generation from summary (available to all users)
      const response = await apiClient.post(
        API_ENDPOINTS.ARTICLES.GENERATE_AUDIO_FROM_SUMMARY(articleId),
        Object.keys(requestBody).length > 0 ? requestBody : {}
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Audio generation from summary started successfully'
      };
    } catch (error) {
      console.error(`Error generating audio from summary for article ${articleId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate audio from summary';
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
   * Get user's audio files with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @param {string} sortBy - Sort field (default: 'createdAt')
   * @param {string} sortDirection - Sort direction 'asc' or 'desc' (default: 'desc')
   * @returns {Promise<Object>} PaginatedResponse with content array and pagination metadata
   */
  async getUserAudioFiles(page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc') {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);

      const response = await apiClient.get(`${API_ENDPOINTS.USER.AUDIO}?${params.toString()}`);
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      return data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
    } catch (error) {
      console.error('Error fetching user audio files:', error);
      return { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
    }
  }

  /**
   * Delete audio file
   * @param {number} audioFileId - Audio file ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteAudio(audioFileId) {
    if (!audioFileId) {
      throw new Error('Audio file ID is required');
    }

    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.ARTICLES.DELETE_AUDIO(audioFileId)
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Audio file deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting audio file ${audioFileId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete audio file';
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

  /**
   * Add article to favorites
   * @param {number} articleId - Article ID
   * @returns {Promise<Object>} Favorite data with article information
   */
  async addArticleToFavorites(articleId) {
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.USER.ADD_ARTICLE_FAVORITE(articleId)
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Article added to favorites successfully'
      };
    } catch (error) {
      console.error(`Error adding article ${articleId} to favorites:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add article to favorites';
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
   * Get user's favorite articles with pagination
   * @param {number} page - Page number (0-indexed, default: 0)
   * @param {number} size - Items per page (default: 10)
   * @param {string} sortBy - Sort field (default: 'updatedAt')
   * @param {string} sortDirection - Sort direction 'asc' or 'desc' (default: 'desc')
   * @returns {Promise<Object>} PaginatedResponse with content array and pagination metadata
   */
  async getArticleFavorites(page = 0, size = 10, sortBy = 'updatedAt', sortDirection = 'desc') {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);

      const response = await apiClient.get(`${API_ENDPOINTS.USER.ARTICLE_FAVORITES}?${params.toString()}`);
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      // Return paginated response structure
      return data || { 
        content: [], 
        page: 0, 
        size: 10, 
        totalElements: 0, 
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true
      };
    } catch (error) {
      console.error('Error fetching article favorites:', error);
      return { 
        content: [], 
        page: 0, 
        size: 10, 
        totalElements: 0, 
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true
      };
    }
  }

  /**
   * Remove article from favorites
   * @param {number} favoriteId - Favorite ID (not article ID)
   * @returns {Promise<Object>} Delete result
   */
  async removeArticleFromFavorites(favoriteId) {
    if (!favoriteId) {
      throw new Error('Favorite ID is required');
    }

    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USER.REMOVE_ARTICLE_FAVORITE(favoriteId)
      );
      
      // Handle both response.data and response.data.data structure
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data,
        message: response.data?.message || 'Article removed from favorites successfully'
      };
    } catch (error) {
      console.error(`Error removing favorite ${favoriteId}:`, error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove article from favorites';
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

export default new NewsService();
