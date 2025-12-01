// =====================================================
// HELP SERVICE
// Service for help content, search, and articles
// =====================================================

import apiClient from '../../../services/core/APIClient';

class HelpService {
  constructor() {
    this.basePath = '/api/help';
  }

  /**
   * Search help content
   * @param {string} query - Search query
   * @param {object} filters - Search filters (category, type, etc.)
   * @returns {Promise<Object>} Search results
   */
  async searchHelpContent(query, filters = {}) {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);

      const response = await apiClient.get(`${this.basePath}/search?${params.toString()}`, {
        _skipAuth: true, // Public endpoint
      });
      return response.data;
    } catch (error) {
      console.error('Help search error:', error);
      // Fallback to client-side search if API fails
      return this.clientSideSearch(query, filters);
    }
  }

  /**
   * Get articles by category
   * @param {string} category - Article category
   * @param {object} pagination - Pagination options
   * @returns {Promise<Object>} Articles
   */
  async getArticlesByCategory(category, pagination = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (pagination.page) params.append('page', pagination.page);
      if (pagination.limit) params.append('limit', pagination.limit || 20);

      const response = await apiClient.get(`${this.basePath}/articles?${params.toString()}`, {
        _skipAuth: true,
      });
      return response.data;
    } catch (error) {
      console.error('Get articles error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch articles');
    }
  }

  /**
   * Get article details
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} Article details
   */
  async getArticleDetails(articleId) {
    try {
      const response = await apiClient.get(`${this.basePath}/articles/${articleId}`, {
        _skipAuth: true,
      });
      return response.data;
    } catch (error) {
      console.error('Get article details error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch article details');
    }
  }

  /**
   * Submit article feedback
   * @param {string} articleId - Article ID
   * @param {object} feedback - Feedback data (helpful, comment, etc.)
   * @returns {Promise<Object>} Result
   */
  async submitArticleFeedback(articleId, feedback) {
    try {
      const response = await apiClient.post(`${this.basePath}/articles/${articleId}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  }

  /**
   * Client-side search fallback
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {Object} Search results
   */
  clientSideSearch(query, filters = {}) {
    // This is a fallback - in production, this would search local help content
    const lowerQuery = query.toLowerCase();
    const results = {
      success: true,
      data: {
        results: [],
        total: 0,
        query,
      },
    };

    // Mock search results for now
    // In production, this would search actual help content
    return results;
  }
}

export const helpService = new HelpService();

