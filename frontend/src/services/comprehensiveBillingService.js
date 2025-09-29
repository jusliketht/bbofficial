import syncApiClient from './apiService';

/**
 * Comprehensive Billing Service - Frontend
 * Provides complete billing, invoicing, and payment management
 * Essential for revenue management and GST compliance
 */
class ComprehensiveBillingService {
  constructor() {
    this.baseEndpoint = '/v2/billing';
  }

  /**
   * Create new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(invoiceData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseEndpoint}/invoices`, invoiceData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create invoice');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invoice creation failed');
    }
  }

  /**
   * Get invoices with pagination and filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Invoices with pagination
   */
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await syncApiClient.client.get(`${this.baseEndpoint}/invoices?${params}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve invoices');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve invoices');
    }
  }

  /**
   * Get specific invoice details
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getInvoice(invoiceId) {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/invoices/${invoiceId}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve invoice');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve invoice');
    }
  }

  /**
   * Update invoice
   * @param {string} invoiceId - Invoice ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoice(invoiceId, updateData) {
    try {
      const response = await syncApiClient.client.put(`${this.baseEndpoint}/invoices/${invoiceId}`, updateData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update invoice');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update invoice');
    }
  }

  /**
   * Delete invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteInvoice(invoiceId) {
    try {
      const response = await syncApiClient.client.delete(`${this.baseEndpoint}/invoices/${invoiceId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to delete invoice');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete invoice');
    }
  }

  /**
   * Process payment for invoice
   * @param {string} invoiceId - Invoice ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(invoiceId, paymentData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseEndpoint}/payments`, {
        invoiceId,
        paymentData
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Payment processing failed');
    }
  }

  /**
   * Get payments with pagination and filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Payments with pagination
   */
  async getPayments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await syncApiClient.client.get(`${this.baseEndpoint}/payments?${params}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve payments');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve payments');
    }
  }

  /**
   * Get specific payment details
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/payments/${paymentId}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve payment');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve payment');
    }
  }

  /**
   * Create refund for payment
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - Refund data
   * @returns {Promise<Object>} Refund result
   */
  async createRefund(paymentId, refundData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseEndpoint}/refunds`, {
        paymentId,
        refundData
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create refund');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Refund creation failed');
    }
  }

  /**
   * Get billing summary for user
   * @param {Object} filters - Filters
   * @returns {Promise<Object>} Billing summary
   */
  async getBillingSummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await syncApiClient.client.get(`${this.baseEndpoint}/summary?${params}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve billing summary');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve billing summary');
    }
  }

  /**
   * Generate GST report
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} GST report
   */
  async generateGSTReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await syncApiClient.client.get(`${this.baseEndpoint}/gst-report?${params}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate GST report');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate GST report');
    }
  }

  /**
   * Get available service categories
   * @returns {Promise<Object>} Service categories
   */
  async getServiceCategories() {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/service-categories`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve service categories');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve service categories');
    }
  }

  /**
   * Get available payment methods
   * @returns {Promise<Object>} Payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/payment-methods`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to retrieve payment methods');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve payment methods');
    }
  }

  /**
   * Calculate GST for amount
   * @param {number} amount - Base amount
   * @param {string} serviceType - Service type
   * @param {string} stateCode - State code
   * @param {string} customerStateCode - Customer state code
   * @returns {Object} GST calculations
   */
  calculateGST(amount, serviceType, stateCode, customerStateCode) {
    const gstRates = {
      'CGST': 0.09,  // 9% CGST
      'SGST': 0.09,  // 9% SGST
      'IGST': 0.18,  // 18% IGST
      'CESS': 0.04   // 4% CESS (if applicable)
    };

    const serviceCategories = {
      'ITR_FILING': {
        name: 'ITR Filing Service',
        hsnCode: '998314',
        description: 'Income Tax Return Filing Services'
      },
      'CONSULTATION': {
        name: 'Tax Consultation',
        hsnCode: '998313',
        description: 'Tax Advisory and Consultation Services'
      },
      'DOCUMENT_PROCESSING': {
        name: 'Document Processing',
        hsnCode: '998314',
        description: 'Document Verification and Processing Services'
      },
      'COMPLIANCE': {
        name: 'Compliance Services',
        hsnCode: '998315',
        description: 'Tax Compliance and Filing Services'
      }
    };

    // Get service category
    const serviceCategory = serviceCategories[serviceType] || serviceCategories['ITR_FILING'];
    
    // Determine GST type based on state
    const isInterState = stateCode !== customerStateCode;
    const gstType = isInterState ? 'IGST' : 'CGST_SGST';
    
    // Calculate GST amounts
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let cessAmount = 0;
    
    if (gstType === 'IGST') {
      igstAmount = amount * gstRates['IGST'];
    } else {
      cgstAmount = amount * gstRates['CGST'];
      sgstAmount = amount * gstRates['SGST'];
    }
    
    // Add CESS if applicable (for high-value services)
    if (amount > 100000) {
      cessAmount = amount * gstRates['CESS'];
    }
    
    const totalGST = cgstAmount + sgstAmount + igstAmount + cessAmount;
    const totalAmount = amount + totalGST;
    
    return {
      baseAmount: amount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cessAmount,
      totalGST,
      totalAmount,
      gstType,
      hsnCode: serviceCategory.hsnCode,
      serviceDescription: serviceCategory.description
    };
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get status display information
   * @param {string} status - Invoice/Payment status
   * @returns {Object} Status display info
   */
  getStatusDisplayInfo(status) {
    const statusMap = {
      'DRAFT': {
        label: 'Draft',
        color: 'gray',
        icon: 'edit',
        description: 'Invoice is in draft state'
      },
      'SENT': {
        label: 'Sent',
        color: 'blue',
        icon: 'send',
        description: 'Invoice has been sent to customer'
      },
      'PAID': {
        label: 'Paid',
        color: 'green',
        icon: 'check-circle',
        description: 'Payment has been received'
      },
      'OVERDUE': {
        label: 'Overdue',
        color: 'red',
        icon: 'alert-circle',
        description: 'Payment is overdue'
      },
      'CANCELLED': {
        label: 'Cancelled',
        color: 'gray',
        icon: 'x-circle',
        description: 'Invoice has been cancelled'
      },
      'PENDING': {
        label: 'Pending',
        color: 'yellow',
        icon: 'clock',
        description: 'Payment is pending'
      },
      'PROCESSING': {
        label: 'Processing',
        color: 'blue',
        icon: 'loader',
        description: 'Payment is being processed'
      },
      'COMPLETED': {
        label: 'Completed',
        color: 'green',
        icon: 'check-circle',
        description: 'Payment completed successfully'
      },
      'FAILED': {
        label: 'Failed',
        color: 'red',
        icon: 'x-circle',
        description: 'Payment failed'
      },
      'CANCELLED': {
        label: 'Cancelled',
        color: 'gray',
        icon: 'x-circle',
        description: 'Payment was cancelled'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'gray',
      icon: 'help-circle',
      description: 'Unknown status'
    };
  }

  /**
   * Validate payment data
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.method) {
      errors.push('Payment method is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valid payment amount is required');
    }

    // Validate based on payment method
    switch (paymentData.method) {
      case 'RAZORPAY':
      case 'STRIPE':
        if (!paymentData.cardDetails) {
          errors.push('Card details are required for card payments');
        } else {
          if (!paymentData.cardDetails.cardNumber) {
            errors.push('Card number is required');
          }
          if (!paymentData.cardDetails.expiryMonth || !paymentData.cardDetails.expiryYear) {
            errors.push('Card expiry is required');
          }
          if (!paymentData.cardDetails.cvv) {
            errors.push('CVV is required');
          }
        }
        break;

      case 'UPI':
        if (!paymentData.upiId) {
          errors.push('UPI ID is required');
        }
        break;

      case 'NET_BANKING':
        if (!paymentData.bankDetails) {
          errors.push('Bank details are required');
        } else {
          if (!paymentData.bankDetails.accountNumber) {
            errors.push('Account number is required');
          }
          if (!paymentData.bankDetails.ifscCode) {
            errors.push('IFSC code is required');
          }
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const comprehensiveBillingService = new ComprehensiveBillingService();

export default comprehensiveBillingService;
