// =====================================================
// PREVIOUS YEAR COPY SERVICE
// Frontend service for previous year copy operations
// =====================================================

import apiClient from '../../../services/core/APIClient';

class PreviousYearCopyService {
  /**
   * Get available previous year filings
   * @param {string} userId - User ID
   * @param {string} memberId - Member ID (optional)
   * @param {string} currentAssessmentYear - Current assessment year
   * @returns {Promise<object>} - Available previous years
   */
  async getAvailablePreviousYears(userId, memberId = null, currentAssessmentYear = '2024-25') {
    try {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId);
      if (currentAssessmentYear) params.append('currentAssessmentYear', currentAssessmentYear);

      const response = await apiClient.get(`/api/itr/previous-years?${params.toString()}`);
      return {
        success: true,
        previousYears: response.data.previousYears || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error('Failed to get available previous years:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch previous years',
        previousYears: [],
        count: 0,
      };
    }
  }

  /**
   * Get previous year data for preview
   * @param {string} filingId - Previous year filing ID
   * @returns {Promise<object>} - Previous year data
   */
  async getPreviousYearData(filingId) {
    try {
      const response = await apiClient.get(`/api/itr/previous-years/${filingId}`);
      return {
        success: true,
        data: response.data.data || null,
      };
    } catch (error) {
      console.error('Failed to get previous year data:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch previous year data',
        data: null,
      };
    }
  }

  /**
   * Copy data from previous year to current filing
   * @param {string} targetFilingId - Target filing ID
   * @param {string} sourceFilingId - Source filing ID (or 'eri' for ERI source)
   * @param {Array<string>} sections - Sections to copy
   * @param {object} reviewData - Optional reviewed/modified data
   * @returns {Promise<object>} - Copy result
   */
  async copyFromPreviousYear(targetFilingId, sourceFilingId, sections, reviewData = null) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${targetFilingId}/copy-from-previous`,
        {
          sourceFilingId,
          sections,
          reviewData,
        },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to copy from previous year:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to copy from previous year',
      };
    }
  }
}

export default new PreviousYearCopyService();

