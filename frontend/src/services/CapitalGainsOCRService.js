// =====================================================
// CAPITAL GAINS OCR SERVICE
// Extract data from sale deeds and broker statements
// =====================================================

import apiClient from './core/APIClient';

class CapitalGainsOCRService {
  constructor() {
    this.apiEndpoint = '/api/ocr';
  }

  /**
   * Extract data from sale deed
   * @param {File} file - Sale deed image or PDF
   * @param {string} transactionId - Optional transaction ID to link document
   * @param {string} assetType - Type of asset (Property, Land, etc.)
   * @returns {Promise<Object>} Extracted sale deed data
   */
  async extractSaleDeedData(file, transactionId = null, assetType = 'Property') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'sale_deed');
      if (transactionId) {
        formData.append('transactionId', transactionId);
      }
      if (assetType) {
        formData.append('assetType', assetType);
      }

      const response = await apiClient.post(`${this.apiEndpoint}/sale-deed`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return {
          success: true,
          data: this.parseSaleDeedData(response.data.extractedData),
          confidence: response.data.confidence || 0,
          rawData: response.data.extractedData,
        };
      }

      throw new Error(response.data.error || 'Failed to extract sale deed data');
    } catch (error) {
      console.error('Sale deed OCR error:', error);
      throw new Error(`Failed to extract sale deed data: ${error.message}`);
    }
  }

  /**
   * Parse extracted sale deed data into structured format
   */
  parseSaleDeedData(rawData) {
    return {
      propertyAddress: rawData.propertyAddress || '',
      sellerName: rawData.sellerName || '',
      buyerName: rawData.buyerName || '',
      registrationNumber: rawData.registrationNumber || '',
      registrationDate: rawData.registrationDate || '',
      saleValue: this.extractAmount(rawData.saleValue),
      purchaseValue: this.extractAmount(rawData.purchaseValue),
      stampDuty: this.extractAmount(rawData.stampDuty),
      registrationFee: this.extractAmount(rawData.registrationFee),
      assetType: rawData.assetType || 'Property',
    };
  }

  /**
   * Extract data from broker statement
   * @param {File} file - Broker statement image or PDF
   * @param {string} brokerName - Optional broker name
   * @param {string} statementType - Type of statement (equity, mutual_fund, etc.)
   * @returns {Promise<Object>} Extracted broker statement data
   */
  async extractBrokerStatementData(file, brokerName = null, statementType = 'equity') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'broker_statement');
      if (brokerName) {
        formData.append('brokerName', brokerName);
      }
      if (statementType) {
        formData.append('statementType', statementType);
      }

      const response = await apiClient.post(`${this.apiEndpoint}/broker-statement`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return {
          success: true,
          data: this.parseBrokerStatementData(response.data.extractedData),
          confidence: response.data.confidence || 0,
          rawData: response.data.extractedData,
        };
      }

      throw new Error(response.data.error || 'Failed to extract broker statement data');
    } catch (error) {
      console.error('Broker statement OCR error:', error);
      throw new Error(`Failed to extract broker statement data: ${error.message}`);
    }
  }

  /**
   * Parse extracted broker statement data into structured format
   */
  parseBrokerStatementData(rawData) {
    return {
      brokerName: rawData.brokerName || '',
      statementPeriod: rawData.statementPeriod || '',
      transactions: (rawData.transactions || []).map(tx => ({
        scriptName: tx.scriptName || '',
        buyDate: tx.buyDate || '',
        sellDate: tx.sellDate || '',
        quantity: parseInt(tx.quantity) || 0,
        buyPrice: parseFloat(tx.buyPrice) || 0,
        sellPrice: parseFloat(tx.sellPrice) || 0,
        buyValue: parseFloat(tx.buyValue) || 0,
        sellValue: parseFloat(tx.sellValue) || 0,
        profit: parseFloat(tx.profit) || 0,
        loss: parseFloat(tx.loss) || 0,
        stt: parseFloat(tx.stt) || 0,
        brokerage: parseFloat(tx.brokerage) || 0,
        stampDuty: parseFloat(tx.stampDuty) || 0,
        transactionType: tx.transactionType || 'STCG',
      })),
      totalProfit: parseFloat(rawData.totalProfit) || 0,
      totalLoss: parseFloat(rawData.totalLoss) || 0,
    };
  }

  /**
   * Extract amount from string or number
   */
  extractAmount(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numericMatch = value.match(/[\d,]+\.?\d*/);
      if (numericMatch) {
        return parseFloat(numericMatch[0].replace(/,/g, '')) || 0;
      }
    }
    return 0;
  }

  /**
   * Validate extracted sale deed data
   */
  validateSaleDeedData(extractedData) {
    const errors = [];
    const warnings = [];

    if (!extractedData.saleValue || extractedData.saleValue === 0) {
      errors.push('Sale value not found or invalid');
    }

    if (!extractedData.registrationDate) {
      warnings.push('Registration date not found - please verify');
    }

    if (!extractedData.registrationNumber) {
      warnings.push('Registration number not found - please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate extracted broker statement data
   */
  validateBrokerStatementData(extractedData) {
    const errors = [];
    const warnings = [];

    if (!extractedData.transactions || extractedData.transactions.length === 0) {
      errors.push('No transactions found in broker statement');
    }

    if (!extractedData.brokerName) {
      warnings.push('Broker name not found - please verify');
    }

    if (!extractedData.statementPeriod) {
      warnings.push('Statement period not found - please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default new CapitalGainsOCRService();

