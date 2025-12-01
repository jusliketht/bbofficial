// =====================================================
// PDF EXPORT SERVICE
// Frontend service for PDF export operations
// =====================================================

import apiClient from '../../../services/core/APIClient';

class PDFExportService {
  /**
   * Export draft as PDF
   * @param {string} draftId - Draft ID
   * @returns {Promise<Blob>} - PDF blob
   */
  async exportDraftPDF(draftId) {
    try {
      const response = await apiClient.get(
        `/api/itr/drafts/${draftId}/export/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export draft PDF:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to export PDF');
    }
  }

  /**
   * Export tax computation as PDF
   * @param {string} filingId - Filing ID
   * @returns {Promise<Blob>} - PDF blob
   */
  async exportTaxComputationPDF(filingId) {
    try {
      const response = await apiClient.get(
        `/api/itr/filings/${filingId}/tax-computation/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export tax computation PDF:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to export PDF');
    }
  }

  /**
   * Export discrepancy report as PDF
   * @param {string} filingId - Filing ID
   * @returns {Promise<Blob>} - PDF blob
   */
  async exportDiscrepancyPDF(filingId) {
    try {
      const response = await apiClient.get(
        `/api/itr/filings/${filingId}/discrepancies/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export discrepancy PDF:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to export PDF');
    }
  }

  /**
   * Export acknowledgment as PDF
   * @param {string} filingId - Filing ID
   * @returns {Promise<Blob>} - PDF blob
   */
  async exportAcknowledgmentPDF(filingId) {
    try {
      const response = await apiClient.get(
        `/api/itr/filings/${filingId}/acknowledgment/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export acknowledgment PDF:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to export PDF');
    }
  }

  /**
   * Download PDF blob as file
   * @param {Blob} blob - PDF blob
   * @param {string} filename - Filename for download
   */
  downloadPDF(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new PDFExportService();

