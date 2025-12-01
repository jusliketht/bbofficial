// =====================================================
// FORM 26AS SERVICE
// Integration with Income Tax Department Form 26AS for payment verification
// =====================================================

const axios = require('axios');
const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

class Form26ASService {
  constructor() {
    this.itdPortalBaseUrl = process.env.ITD_PORTAL_BASE_URL || 'https://www.incometax.gov.in';
    this.isLiveMode = process.env.FEATURE_FORM26AS_LIVE === 'true';

    this.axiosInstance = axios.create({
      baseURL: this.itdPortalBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    enterpriseLogger.info('Form26ASService initialized', {
      mode: this.isLiveMode ? 'LIVE' : 'MOCK',
      baseUrl: this.itdPortalBaseUrl,
    });
  }

  /**
   * Fetch tax payments from Form 26AS
   * @param {string} pan - PAN number
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<Array>} - Tax payments from 26AS
   */
  async fetchTaxPayments(pan, assessmentYear) {
    try {
      enterpriseLogger.info('Fetching tax payments from Form 26AS', {
        pan,
        assessmentYear,
      });

      if (!this.isLiveMode) {
        return this.mockTaxPayments(pan, assessmentYear);
      }

      // Actual Form 26AS API integration would go here
      // This typically requires:
      // 1. User authentication with ITD portal
      // 2. Fetching Form 26AS Part C (Tax Paid) data
      // 3. Parsing and returning tax payment entries

      // Placeholder implementation
      const response = await this.axiosInstance.get('/form26as/tax-payments', {
        params: { pan, assessmentYear },
      });

      enterpriseLogger.info('Tax payments fetched from Form 26AS', {
        pan,
        assessmentYear,
        count: response.data?.payments?.length || 0,
      });

      return response.data?.payments || [];
    } catch (error) {
      enterpriseLogger.error('Failed to fetch tax payments from Form 26AS', {
        pan,
        assessmentYear,
        error: error.message,
      });

      if (this.isLiveMode) {
        throw new AppError(`Failed to fetch tax payments from Form 26AS: ${error.message}`, 500);
      }

      // Return mock data in development mode
      return this.mockTaxPayments(pan, assessmentYear);
    }
  }

  /**
   * Verify challan payment against Form 26AS
   * @param {string} challanNumber - Challan number
   * @param {number} amount - Payment amount
   * @param {string} paymentDate - Payment date (optional)
   * @param {string} pan - PAN number
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<object>} - Verification result
   */
  async verifyChallanPayment(challanNumber, amount, paymentDate, pan, assessmentYear) {
    try {
      enterpriseLogger.info('Verifying challan payment via Form 26AS', {
        challanNumber,
        amount,
        pan,
        assessmentYear,
      });

      // Fetch tax payments from 26AS
      const taxPayments = await this.fetchTaxPayments(pan, assessmentYear);

      // Search for matching challan
      const matchingPayment = taxPayments.find((payment) => {
        const challanMatch = payment.challanNumber === challanNumber || 
                           payment.challanSerialNumber === challanNumber;
        const amountMatch = Math.abs(parseFloat(payment.amount) - parseFloat(amount)) < 1; // Allow 1 rupee difference
        
        return challanMatch && amountMatch;
      });

      if (matchingPayment) {
        enterpriseLogger.info('Challan payment verified via Form 26AS', {
          challanNumber,
          amount,
          verifiedAmount: matchingPayment.amount,
          paymentDate: matchingPayment.paymentDate,
        });

        return {
          verified: true,
          challanNumber: matchingPayment.challanNumber || matchingPayment.challanSerialNumber,
          amount: matchingPayment.amount,
          paymentDate: matchingPayment.paymentDate || matchingPayment.dateOfDepositing,
          bankReference: matchingPayment.bankReference,
          paymentMode: matchingPayment.paymentMode,
          details: matchingPayment,
        };
      }

      enterpriseLogger.warn('Challan payment not found in Form 26AS', {
        challanNumber,
        amount,
        pan,
        assessmentYear,
      });

      return {
        verified: false,
        challanNumber,
        amount,
        reason: 'Challan not found in Form 26AS',
      };
    } catch (error) {
      enterpriseLogger.error('Failed to verify challan payment via Form 26AS', {
        challanNumber,
        amount,
        error: error.message,
      });
      throw new AppError(`Failed to verify challan payment: ${error.message}`, 500);
    }
  }

  /**
   * Sync all payments for a filing from Form 26AS
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Sync result
   */
  async syncPaymentsForFiling(filingId) {
    try {
      enterpriseLogger.info('Syncing payments for filing from Form 26AS', { filingId });

      const { ITRFiling } = require('../../models');
      const filing = await ITRFiling.findByPk(filingId);
      
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      // Extract PAN from filing
      const jsonPayload = filing.jsonPayload || {};
      const pan = jsonPayload.personal_info?.pan || jsonPayload.personalInfo?.pan;
      
      if (!pan) {
        throw new AppError('PAN not found in filing', 400);
      }

      // Fetch tax payments from 26AS
      const taxPayments = await this.fetchTaxPayments(pan, filing.assessmentYear);

      // Process and return payments
      const processedPayments = taxPayments.map((payment) => ({
        challanNumber: payment.challanNumber || payment.challanSerialNumber,
        amount: payment.amount,
        paymentDate: payment.paymentDate || payment.dateOfDepositing,
        typeOfPayment: this.mapPaymentTypeFrom26AS(payment.typeOfPayment),
        bankReference: payment.bankReference,
        paymentMode: payment.paymentMode,
        verified: true,
        source: 'form26as',
      }));

      enterpriseLogger.info('Payments synced from Form 26AS', {
        filingId,
        paymentCount: processedPayments.length,
      });

      return {
        success: true,
        payments: processedPayments,
        count: processedPayments.length,
      };
    } catch (error) {
      enterpriseLogger.error('Failed to sync payments from Form 26AS', {
        filingId,
        error: error.message,
      });
      throw new AppError(`Failed to sync payments: ${error.message}`, 500);
    }
  }

  // Helper methods

  mapPaymentTypeFrom26AS(typeCode) {
    const mapping = {
      '100': 'advance_tax',
      '300': 'self_assessment',
      '400': 'regular_assessment',
    };
    return mapping[typeCode] || 'advance_tax';
  }

  mockTaxPayments(pan, assessmentYear) {
    // Mock tax payments for development/testing
    const mockPayments = [
      {
        challanNumber: `ITNS280-${Date.now()}`,
        challanSerialNumber: `ITNS280-${Date.now()}`,
        amount: 10000,
        paymentDate: new Date().toISOString(),
        typeOfPayment: '100',
        bankReference: `BANKREF${Date.now()}`,
        paymentMode: 'netbanking',
        dateOfDepositing: new Date().toISOString(),
      },
    ];

    enterpriseLogger.info('Mock tax payments returned', {
      pan,
      assessmentYear,
      count: mockPayments.length,
    });

    return mockPayments;
  }
}

module.exports = new Form26ASService();

