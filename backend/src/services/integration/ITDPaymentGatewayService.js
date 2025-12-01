// =====================================================
// ITD PAYMENT GATEWAY SERVICE
// Integration with Income Tax Department payment gateway
// =====================================================

const axios = require('axios');
const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

class ITDPaymentGatewayService {
  constructor() {
    this.itdGatewayBaseUrl = process.env.ITD_PAYMENT_GATEWAY_URL || 'https://www.incometax.gov.in/iec/foportal/help/online-payment';
    this.itdApiKey = process.env.ITD_PAYMENT_API_KEY;
    this.isLiveMode = process.env.FEATURE_ITD_PAYMENT_LIVE === 'true';

    this.axiosInstance = axios.create({
      baseURL: this.itdGatewayBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.itdApiKey && { 'X-API-Key': this.itdApiKey }),
      },
    });

    enterpriseLogger.info('ITDPaymentGatewayService initialized', {
      mode: this.isLiveMode ? 'LIVE' : 'MOCK',
      baseUrl: this.itdGatewayBaseUrl,
    });
  }

  /**
   * Generate ITD payment gateway URL
   * @param {object} challanData - Challan data
   * @param {object} filingData - Filing data (for PAN, etc.)
   * @returns {Promise<string>} - Payment gateway URL
   */
  async generatePaymentURL(challanData, filingData) {
    try {
      enterpriseLogger.info('Generating ITD payment URL', {
        challanNumber: challanData.challanNumber,
        amount: challanData.amount,
      });

      if (!this.isLiveMode) {
        // Return mock payment URL
        return this.mockPaymentURL(challanData);
      }

      // Actual ITD gateway integration would go here
      // This typically involves:
      // 1. Creating a payment session with ITD gateway
      // 2. Getting a payment token/session ID
      // 3. Constructing the payment URL with the token

      // Placeholder implementation
      const paymentParams = {
        challan: challanData.challanNumber,
        amount: challanData.amount,
        assessmentYear: challanData.assessmentYear,
        typeOfPayment: challanData.typeOfPayment,
        pan: filingData.pan,
        majorHead: challanData.majorHead || '0021',
        minorHead: challanData.minorHead || '100',
      };

      // Construct payment URL
      const params = new URLSearchParams();
      Object.entries(paymentParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const paymentURL = `${this.itdGatewayBaseUrl}?${params.toString()}`;

      enterpriseLogger.info('ITD payment URL generated', {
        challanNumber: challanData.challanNumber,
        paymentURL: paymentURL.substring(0, 100) + '...',
      });

      return paymentURL;
    } catch (error) {
      enterpriseLogger.error('Failed to generate ITD payment URL', {
        error: error.message,
        challanData,
      });
      throw new AppError(`Failed to generate ITD payment URL: ${error.message}`, 500);
    }
  }

  /**
   * Handle ITD payment callback/webhook
   * @param {object} callbackData - Callback data from ITD gateway
   * @returns {Promise<object>} - Processed callback data
   */
  async handleCallback(callbackData) {
    try {
      enterpriseLogger.info('Handling ITD payment callback', {
        transactionId: callbackData.transaction_id,
        challanNumber: callbackData.challan_number,
      });

      // Verify callback signature if ITD provides one
      if (callbackData.signature && this.itdApiKey) {
        const isValid = this.verifyCallbackSignature(callbackData);
        if (!isValid) {
          throw new AppError('Invalid callback signature', 400);
        }
      }

      // Process callback data
      const processedData = {
        transactionId: callbackData.transaction_id || callbackData.transactionId,
        challanNumber: callbackData.challan_number || callbackData.challanNumber,
        amount: callbackData.amount,
        status: callbackData.status || callbackData.payment_status,
        paymentDate: callbackData.payment_date || callbackData.paymentDate,
        bankReference: callbackData.bank_reference || callbackData.bankReference,
        paymentMode: callbackData.payment_mode || callbackData.paymentMode,
        rawCallback: callbackData,
      };

      enterpriseLogger.info('ITD payment callback processed', {
        transactionId: processedData.transactionId,
        status: processedData.status,
      });

      return processedData;
    } catch (error) {
      enterpriseLogger.error('Failed to handle ITD payment callback', {
        error: error.message,
        callbackData,
      });
      throw new AppError(`Failed to handle ITD payment callback: ${error.message}`, 500);
    }
  }

  /**
   * Verify ITD transaction status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object>} - Transaction status
   */
  async verifyTransaction(transactionId) {
    try {
      enterpriseLogger.info('Verifying ITD transaction', { transactionId });

      if (!this.isLiveMode) {
        return this.mockTransactionStatus(transactionId);
      }

      // Actual ITD API call to verify transaction
      // This would typically involve:
      // 1. Calling ITD API endpoint with transaction ID
      // 2. Getting transaction status
      // 3. Returning status details

      // Placeholder implementation
      const response = await this.axiosInstance.get(`/transaction/${transactionId}/status`);

      enterpriseLogger.info('ITD transaction verified', {
        transactionId,
        status: response.data.status,
      });

      return {
        transactionId,
        status: response.data.status,
        amount: response.data.amount,
        paymentDate: response.data.payment_date,
        challanNumber: response.data.challan_number,
      };
    } catch (error) {
      enterpriseLogger.error('Failed to verify ITD transaction', {
        transactionId,
        error: error.message,
      });
      throw new AppError(`Failed to verify ITD transaction: ${error.message}`, 500);
    }
  }

  // Helper methods

  verifyCallbackSignature(callbackData) {
    // Verify callback signature if ITD provides signature verification
    // This is a placeholder - actual implementation depends on ITD's signature method
    if (!callbackData.signature || !this.itdApiKey) {
      return false;
    }

    // Construct signature string (format depends on ITD's specification)
    const signatureString = `${callbackData.transaction_id}|${callbackData.amount}|${callbackData.challan_number}`;
    
    // Verify signature (method depends on ITD's implementation)
    // This is a placeholder
    return true;
  }

  mockPaymentURL(challanData) {
    // Mock payment URL for development/testing
    const mockURL = `${this.itdGatewayBaseUrl}/mock?challan=${challanData.challanNumber}&amount=${challanData.amount}`;
    
    enterpriseLogger.info('Mock ITD payment URL generated', {
      challanNumber: challanData.challanNumber,
      mockURL,
    });

    return mockURL;
  }

  async mockTransactionStatus(transactionId) {
    // Mock transaction status for development/testing
    return {
      transactionId,
      status: 'completed',
      amount: 10000,
      paymentDate: new Date().toISOString(),
      challanNumber: `ITNS280-${Date.now()}`,
    };
  }
}

module.exports = new ITDPaymentGatewayService();

