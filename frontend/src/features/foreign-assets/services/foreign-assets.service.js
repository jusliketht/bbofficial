// =====================================================
// FOREIGN ASSETS SERVICE
// Frontend service for foreign assets (Schedule FA) operations
// =====================================================

import apiClient from '../../../services/core/APIClient';

class ForeignAssetsService {
  /**
   * Get foreign assets for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Foreign assets data
   */
  async getForeignAssets(filingId) {
    try {
      const response = await apiClient.get(
        `/api/itr/filings/${filingId}/foreign-assets`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get foreign assets:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get foreign assets',
        assets: [],
        totalValue: 0,
      };
    }
  }

  /**
   * Add foreign asset
   * @param {string} filingId - Filing ID
   * @param {object} assetData - Asset data
   * @returns {Promise<object>} - Created asset
   */
  async addForeignAsset(filingId, assetData) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/foreign-assets`,
        assetData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to add foreign asset:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add foreign asset',
      };
    }
  }

  /**
   * Update foreign asset
   * @param {string} filingId - Filing ID
   * @param {string} assetId - Asset ID
   * @param {object} assetData - Updated asset data
   * @returns {Promise<object>} - Updated asset
   */
  async updateForeignAsset(filingId, assetId, assetData) {
    try {
      const response = await apiClient.put(
        `/api/itr/filings/${filingId}/foreign-assets/${assetId}`,
        assetData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update foreign asset:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update foreign asset',
      };
    }
  }

  /**
   * Delete foreign asset
   * @param {string} filingId - Filing ID
   * @param {string} assetId - Asset ID
   * @returns {Promise<object>} - Deletion result
   */
  async deleteForeignAsset(filingId, assetId) {
    try {
      const response = await apiClient.delete(
        `/api/itr/filings/${filingId}/foreign-assets/${assetId}`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to delete foreign asset:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete foreign asset',
      };
    }
  }

  /**
   * Upload document for foreign asset
   * @param {string} filingId - Filing ID
   * @param {string} assetId - Asset ID
   * @param {string} documentUrl - Document URL
   * @param {string} documentType - Document type
   * @returns {Promise<object>} - Upload result
   */
  async uploadDocument(filingId, assetId, documentUrl, documentType) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/foreign-assets/${assetId}/documents`,
        {
          documentUrl,
          documentType,
        },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to upload document:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to upload document',
      };
    }
  }
}

export default new ForeignAssetsService();

