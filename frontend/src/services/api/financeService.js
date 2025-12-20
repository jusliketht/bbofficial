// =====================================================
// FINANCE SERVICE
// API client for finance operations
// =====================================================

import apiClient from './apiClient';
import errorHandler from '../../utils/errorHandler';

const financeService = {
  /**
   * Get invoice for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} Invoice data
   */
  async getInvoice(filingId) {
    try {
      const response = await apiClient.get(`/finance/invoices/${filingId}`);
      return response.data;
    } catch (error) {
      errorHandler.handle(error);
      throw error;
    }
  },

  /**
   * Get payment options for an invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<object>} Payment options
   */
  async getPaymentOptions(invoiceId) {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/payment-options`);
      return response.data;
    } catch (error) {
      errorHandler.handle(error);
      throw error;
    }
  },

  /**
   * Initiate payment for an invoice
   * @param {string} invoiceId - Invoice ID
   * @param {object} paymentData - Payment data (method, amount)
   * @returns {Promise<object>} Payment initiation response
   */
  async initiatePayment(invoiceId, paymentData) {
    try {
      const response = await apiClient.post(`/finance/invoices/${invoiceId}/pay`, paymentData);
      return response.data;
    } catch (error) {
      errorHandler.handle(error);
      throw error;
    }
  },

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<object>} Payment data
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await apiClient.get(`/finance/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      errorHandler.handle(error);
      throw error;
    }
  },

  /**
   * Get payments for an invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<object>} Payments data
   */
  async getPayments(invoiceId) {
    try {
      // Note: This endpoint would need to be added to the backend
      // For now, we'll use a workaround or return empty array
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/payments`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        return { payments: [] };
      }
      errorHandler.handle(error);
      throw error;
    }
  },

  /**
   * Get reconciliation for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} Reconciliation data
   */
  async getReconciliation(filingId) {
    try {
      const response = await apiClient.get(`/finance/filings/${filingId}/reconcile`);
      return response.data;
    } catch (error) {
      errorHandler.handle(error);
      throw error;
    }
  },
};

export default financeService;

