// =====================================================
// AI RECOMMENDATION ENGINE
// Frontend service for AI recommendations
// =====================================================

import apiClient from './core/APIClient';

class AIRecommendationEngine {
  constructor() {
    this.recommendationsCache = new Map();
  }

  /**
   * Get AI recommendations for form data
   * @param {object} formData - ITR form data
   * @param {string} itrType - ITR type
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<array>} Array of recommendations
   */
  async getRecommendations(formData, itrType, assessmentYear = '2024-25') {
    try {
      const cacheKey = `${itrType}-${assessmentYear}-${JSON.stringify(formData).substring(0, 100)}`;

      // Check cache
      if (this.recommendationsCache.has(cacheKey)) {
        return this.recommendationsCache.get(cacheKey);
      }

      const response = await apiClient.post('/itr/recommendations', {
        formData,
        itrType,
        assessmentYear,
      });

      if (response.data.success) {
        // Cache for 2 minutes
        this.recommendationsCache.set(cacheKey, response.data.recommendations);
        setTimeout(() => {
          this.recommendationsCache.delete(cacheKey);
        }, 2 * 60 * 1000);

        return response.data.recommendations;
      }

      throw new Error(response.data.error || 'Failed to get recommendations');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get recommendations';
      throw new Error(errorMessage);
    }
  }

  /**
   * Apply a recommendation to form data
   * @param {object} recommendation - Recommendation object with action
   * @param {object} currentFormData - Current form data
   * @returns {object} Updated form data
   */
  applyRecommendation(recommendation, currentFormData) {
    if (!recommendation.action) {
      return currentFormData;
    }

    const { field, value } = recommendation.action;
    const fieldPath = field.split('.');

    const updated = { ...currentFormData };
    let current = updated;

    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!current[fieldPath[i]]) {
        current[fieldPath[i]] = {};
      }
      current = current[fieldPath[i]];
    }

    current[fieldPath[fieldPath.length - 1]] = value;

    return updated;
  }

  /**
   * Get recommendations by type
   * @param {array} recommendations - All recommendations
   * @param {string} type - Recommendation type (tax_optimization, deduction_suggestion, compliance_warning)
   * @returns {array} Filtered recommendations
   */
  getRecommendationsByType(recommendations, type) {
    return recommendations.filter(rec => rec.type === type);
  }

  /**
   * Get recommendations by priority
   * @param {array} recommendations - All recommendations
   * @param {string} priority - Priority level (high, medium, low)
   * @returns {array} Filtered recommendations
   */
  getRecommendationsByPriority(recommendations, priority) {
    return recommendations.filter(rec => rec.priority === priority);
  }

  /**
   * Clear recommendations cache
   */
  clearCache() {
    this.recommendationsCache.clear();
  }
}

export default new AIRecommendationEngine();

