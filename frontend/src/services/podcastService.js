/**
 * Podcast-related API services
 * Handles all podcast operations including episodes, playlists, and metadata
 */

import apiClient from './apiClient';

export const podcastService = {
  /**
   * Get paginated list of episodes
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search query
   * @returns {Promise<Object>} API response with episodes data
   */
  async getEpisodes({ page = 1, limit = 10, category, search } = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await apiClient.get(`/episodes?${params}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch episodes'
      };
    }
  },

  /**
   * Get episode by ID
   * @param {string} episodeId - Episode identifier
   * @returns {Promise<Object>} API response with episode data
   */
  async getEpisodeById(episodeId) {
    try {
      const response = await apiClient.get(`/episodes/${episodeId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch episode'
      };
    }
  },

  /**
   * Get podcast categories
   * @returns {Promise<Object>} API response with categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/categories');
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  /**
   * Get user's favorite episodes
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} API response with favorites
   */
  async getFavorites({ page = 1, limit = 10 } = {}) {
    try {
      const response = await apiClient.get(`/favorites?page=${page}&limit=${limit}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch favorites'
      };
    }
  },

  /**
   * Add episode to favorites
   * @param {string} episodeId - Episode identifier
   * @returns {Promise<Object>} API response
   */
  async addToFavorites(episodeId) {
    try {
      const response = await apiClient.post(`/favorites/${episodeId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to add to favorites'
      };
    }
  },

  /**
   * Remove episode from favorites
   * @param {string} episodeId - Episode identifier
   * @returns {Promise<Object>} API response
   */
  async removeFromFavorites(episodeId) {
    try {
      const response = await apiClient.delete(`/favorites/${episodeId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to remove from favorites'
      };
    }
  }
};
