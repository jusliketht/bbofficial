// =====================================================
// KNOWLEDGE BASE SERVICE
// Frontend API service for knowledge base
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class KnowledgeBaseService {
  constructor() {
    this.basePath = '/api/tools';
  }

  /**
   * Search knowledge base
   */
  async search(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (options.category) {
        params.append('category', options.category);
      }
      if (options.section) {
        params.append('section', options.section);
      }

      const response = await apiClient.get(
        `${this.basePath}/knowledge-base/search?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to search knowledge base');
    }
  }

  /**
   * Get topic
   */
  async getTopic(topicId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/knowledge-base/topics/${topicId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get topic:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get topic');
    }
  }

  /**
   * Get section explanation
   */
  async getSectionExplanation(sectionId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/knowledge-base/sections/${sectionId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get section explanation:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get section explanation');
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();

