/**
 * AI-related API services
 * Handles AI features including content generation, transcription, and analysis
 */

import apiClient from './apiClient';

export const aiService = {
  /**
   * Generate podcast content using AI
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Content prompt
   * @param {string} params.style - Content style (conversational, formal, etc.)
   * @param {number} params.maxLength - Maximum content length
   * @param {string} params.topic - Topic or theme
   * @returns {Promise<Object>} API response with generated content
   */
  async generateContent({ prompt, style = 'conversational', maxLength = 1000, topic } = {}) {
    try {
      const response = await apiClient.post('/ai/generate-content', {
        prompt,
        style,
        maxLength,
        topic
      });
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to generate content'
      };
    }
  },

  /**
   * Transcribe audio file
   * @param {File} audioFile - Audio file to transcribe
   * @param {Object} options - Transcription options
   * @param {string} options.language - Audio language
   * @param {boolean} options.timestamps - Include timestamps
   * @returns {Promise<Object>} API response with transcription
   */
  async transcribeAudio(audioFile, { language = 'en', timestamps = true } = {}) {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('language', language);
      formData.append('timestamps', timestamps.toString());

      const response = await apiClient.post('/ai/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to transcribe audio'
      };
    }
  },

  /**
   * Analyze podcast content
   * @param {string} content - Text content to analyze
   * @param {Object} options - Analysis options
   * @param {string[]} options.analysisTypes - Types of analysis to perform
   * @returns {Promise<Object>} API response with analysis results
   */
  async analyzeContent(content, { analysisTypes = ['sentiment', 'topics', 'keywords'] } = {}) {
    try {
      const response = await apiClient.post('/ai/analyze', {
        content,
        analysisTypes
      });
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to analyze content'
      };
    }
  },

  /**
   * Get AI suggestions for podcast improvement
   * @param {string} episodeId - Episode identifier
   * @returns {Promise<Object>} API response with suggestions
   */
  async getSuggestions(episodeId) {
    try {
      const response = await apiClient.get(`/ai/suggestions/${episodeId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to get suggestions'
      };
    }
  },

  /**
   * Generate podcast summary
   * @param {string} episodeId - Episode identifier
   * @param {Object} options - Summary options
   * @param {number} options.maxLength - Maximum summary length
   * @param {string} options.style - Summary style
   * @returns {Promise<Object>} API response with summary
   */
  async generateSummary(episodeId, { maxLength = 500, style = 'concise' } = {}) {
    try {
      const response = await apiClient.post(`/ai/summarize/${episodeId}`, {
        maxLength,
        style
      });
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error.response?.data?.message || 'Failed to generate summary'
      };
    }
  }
};
