// =====================================================
// RENT RECEIPT OCR SERVICE
// Extract data from rent receipt images/PDFs
// =====================================================

import apiClient from './core/APIClient';

class RentReceiptOCRService {
  constructor() {
    this.apiEndpoint = '/api/ocr/rent-receipt';
  }

  /**
   * Extract data from rent receipt
   * @param {File} file - Rent receipt image or PDF
   * @returns {Promise<Object>} Extracted rent receipt data
   */
  async extractRentReceiptData(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'rent_receipt');

      const response = await apiClient.post(this.apiEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return {
          success: true,
          data: this.parseExtractedData(response.data.extractedData),
          confidence: response.data.confidence || 0,
          rawData: response.data.extractedData,
        };
      }

      throw new Error(response.data.error || 'Failed to extract rent receipt data');
    } catch (error) {
      console.error('Rent receipt OCR error:', error);
      throw new Error(`Failed to extract rent receipt data: ${error.message}`);
    }
  }

  /**
   * Parse extracted OCR data into structured format
   */
  parseExtractedData(rawData) {
    return {
      landlordName: this.extractField(rawData, ['landlord', 'landlord_name', 'name', 'from']),
      propertyAddress: this.extractField(rawData, ['address', 'property_address', 'property', 'location']),
      rentAmount: this.extractAmount(rawData, ['rent', 'amount', 'rent_amount', 'rupees', 'rs']),
      period: this.extractPeriod(rawData),
      tdsDeducted: this.extractAmount(rawData, ['tds', 'tax_deducted', 'tds_amount']),
      receiptDate: this.extractDate(rawData),
      receiptNumber: this.extractField(rawData, ['receipt_no', 'receipt_number', 'receipt', 'no']),
    };
  }

  /**
   * Extract field value from OCR data
   */
  extractField(data, possibleKeys) {
    if (!data || typeof data !== 'object') return '';

    for (const key of possibleKeys) {
      const value = data[key] || data[key.toLowerCase()] || data[key.toUpperCase()];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    // Try to find in text content
    if (data.text) {
      for (const key of possibleKeys) {
        const regex = new RegExp(`${key}[\\s:]*([^\\n]+)`, 'i');
        const match = data.text.match(regex);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }

    return '';
  }

  /**
   * Extract amount from OCR data
   */
  extractAmount(data, possibleKeys) {
    const fieldValue = this.extractField(data, possibleKeys);
    if (!fieldValue) return 0;

    // Extract numeric value
    const numericMatch = fieldValue.match(/[\d,]+\.?\d*/);
    if (numericMatch) {
      return parseFloat(numericMatch[0].replace(/,/g, '')) || 0;
    }

    return 0;
  }

  /**
   * Extract period from OCR data
   */
  extractPeriod(data) {
    const periodText = this.extractField(data, ['period', 'for', 'month', 'duration', 'time']);
    if (!periodText) return '';

    // Try to extract month/year pattern
    const monthYearMatch = periodText.match(/(\w+)\s*(\d{4})/i);
    if (monthYearMatch) {
      return `${monthYearMatch[1]} ${monthYearMatch[2]}`;
    }

    return periodText;
  }

  /**
   * Extract date from OCR data
   */
  extractDate(data) {
    const dateText = this.extractField(data, ['date', 'receipt_date', 'dated']);
    if (!dateText) return '';

    // Try to parse common date formats
    const dateFormats = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/, // DD-MM-YYYY or DD/MM/YYYY
      /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
    ];

    for (const format of dateFormats) {
      const match = dateText.match(format);
      if (match) {
        return dateText;
      }
    }

    return dateText;
  }

  /**
   * Validate extracted rent receipt data
   */
  validateExtractedData(extractedData) {
    const errors = [];
    const warnings = [];

    if (!extractedData.rentAmount || extractedData.rentAmount === 0) {
      errors.push('Rent amount not found or invalid');
    }

    if (!extractedData.period) {
      warnings.push('Period not found - please verify');
    }

    if (!extractedData.landlordName) {
      warnings.push('Landlord name not found - please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Extract data from property document (sale deed, registration, etc.)
   * @param {File} file - Property document image or PDF
   * @param {string} propertyId - Optional property ID to link document
   * @param {string} documentType - Type of document (sale_deed, registration, etc.)
   * @returns {Promise<Object>} Extracted property document data
   */
  async extractPropertyDocumentData(file, propertyId = null, documentType = 'sale_deed') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (propertyId) {
        formData.append('propertyId', propertyId);
      }

      const response = await apiClient.post('/api/ocr/property-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.extractedData,
          confidence: response.data.confidence || 0,
          rawData: response.data.extractedData,
        };
      }

      throw new Error(response.data.error || 'Failed to extract property document data');
    } catch (error) {
      console.error('Property document OCR error:', error);
      throw new Error(`Failed to extract property document data: ${error.message}`);
    }
  }

  /**
   * Batch process multiple rent receipts
   * @param {File[]} files - Array of rent receipt files
   * @param {string} filingId - Filing ID
   * @param {string} propertyId - Optional property ID to link receipts
   * @returns {Promise<Object>} Batch processing results
   */
  async batchProcessRentReceipts(files, filingId, propertyId = null) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('filingId', filingId);
      if (propertyId) {
        formData.append('propertyId', propertyId);
      }

      const response = await apiClient.post('/api/ocr/rent-receipts-batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return {
          success: true,
          results: response.data.results || [],
          totalProcessed: response.data.totalProcessed || 0,
          successful: response.data.successful || 0,
          failed: response.data.failed || 0,
        };
      }

      throw new Error(response.data.error || 'Failed to process rent receipts');
    } catch (error) {
      console.error('Batch rent receipt OCR error:', error);
      throw new Error(`Failed to process rent receipts: ${error.message}`);
    }
  }

  /**
   * Process rent receipts and apply to filing
   * @param {Array} receipts - Array of receipt data objects with extracted data
   * @param {string} filingId - Filing ID
   * @param {string} propertyId - Optional property ID
   * @returns {Promise<Object>} Processing result
   */
  async processRentReceiptsForFiling(receipts, filingId, propertyId = null) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/income/house-property/ocr-rent-receipts`,
        {
          receipts,
          propertyId,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          receipts: response.data.receipts || [],
          totalProcessed: response.data.totalProcessed || 0,
        };
      }

      throw new Error(response.data.error || 'Failed to process rent receipts');
    } catch (error) {
      console.error('Process rent receipts for filing error:', error);
      throw new Error(`Failed to process rent receipts: ${error.message}`);
    }
  }
}

export default new RentReceiptOCRService();

