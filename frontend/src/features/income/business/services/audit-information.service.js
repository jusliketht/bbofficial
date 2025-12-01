// =====================================================
// AUDIT INFORMATION SERVICE
// API service for audit information
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class AuditInformationService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get audit information for a filing
   */
  async getAuditInformation(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/audit-information`,
      );
      return {
        success: true,
        auditInfo: response.data.auditInfo || {
          isAuditApplicable: false,
          auditReason: '',
          auditReportNumber: '',
          auditReportDate: '',
          caDetails: {
            caName: '',
            membershipNumber: '',
            firmName: '',
            firmAddress: '',
          },
          bookOfAccountsMaintained: false,
          form3CDFiled: false,
        },
        applicability: response.data.applicability,
      };
    } catch (error) {
      console.error('Failed to get audit information:', error);
      throw new Error(error.response?.data?.error || 'Failed to get audit information');
    }
  }

  /**
   * Update audit information
   */
  async updateAuditInformation(filingId, auditData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/audit-information`,
        auditData,
      );
      return {
        success: true,
        auditInfo: response.data.auditInfo,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update audit information:', error);
      throw new Error(error.response?.data?.error || 'Failed to update audit information');
    }
  }

  /**
   * Check audit applicability
   */
  async checkAuditApplicability(filingId) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/audit-information/check-applicability`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to check audit applicability:', error);
      throw new Error(error.response?.data?.error || 'Failed to check audit applicability');
    }
  }
}

export const auditInformationService = new AuditInformationService();

