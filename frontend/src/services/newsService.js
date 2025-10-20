/**
 * News Service - API integration for news content
 * Handles all news-related API calls for HomePage
 */

import apiClient from './apiClient';

class NewsService {
  /**
   * Get featured article for hero section
   * @returns {Promise<Object>} Featured article data
   */
  async getFeaturedArticle() {
    try {
      const response = await apiClient.get('/news/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured article:', error);
      throw error;
    }
  }

  /**
   * Get trending articles for side panel
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of trending articles
   */
  async getTrendingArticles(limit = 4) {
    try {
      const response = await apiClient.get(`/news/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      throw error;
    }
  }

  /**
   * Get latest articles
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of latest articles
   */
  async getLatestArticles(limit = 4) {
    try {
      const response = await apiClient.get(`/news/latest?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      throw error;
    }
  }

  /**
   * Get article by ID
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Article data
   */
  async getArticleById(id) {
    try {
      const response = await apiClient.get(`/news/${id}`);
      return response.data;
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
      const response = await apiClient.post(`/news/${articleId}/view`);
      return response.data;
    } catch (error) {
      console.error(`Error tracking view for article ${articleId}:`, error);
      throw error;
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
}

export default new NewsService();
