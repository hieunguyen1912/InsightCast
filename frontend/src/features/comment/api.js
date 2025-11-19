/**
 * Comment Service - API integration for comments
 * Handles all comment-related API calls
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

class CommentService {
 
  async createComment(articleId, content, parentId = null) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.COMMENTS.CREATE(articleId),
        { content, parentId }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create comment'
      };
    }
  }

  async getComments(articleId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.COMMENTS.GET_BY_ARTICLE(articleId)
      );
      
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch comments',
        data: []
      };
    }
  }

  async getReplies(commentId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.COMMENTS.GET_REPLIES(commentId)
      );
      
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Error fetching replies:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch replies',
        data: []
      };
    }
  }

  
  async updateComment(articleId, commentId, content) {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.COMMENTS.UPDATE(articleId, commentId),
        { content }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update comment'
      };
    }
  }

  
  async deleteComment(articleId, commentId) {
    try {
      await apiClient.delete(
        API_ENDPOINTS.COMMENTS.DELETE(articleId, commentId)
      );
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete comment'
      };
    }
  }
}

const commentService = new CommentService();
export default commentService;

