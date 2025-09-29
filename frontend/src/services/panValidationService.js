import { apiClient } from './api';

class PANValidationService {
  constructor() {
    this.baseURL = '/pan-validation';
  }

  async validatePAN(panNumber) {
    try {
      const response = await apiClient.post(`${this.baseURL}/validate`, { panNumber });
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            pan: response.data.data.pan,
            name: response.data.data.name,
            lastFiled: response.data.data.lastFiled,
            eligibility: response.data.data.eligibility
          },
          message: response.data.message
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'PAN validation failed'
      };
    } catch (error) {
      console.error('PAN validation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'PAN validation failed'
      };
    }
  }

  getValidationMessage(result) {
    if (result.success) {
      return `PAN validated successfully for ${result.data.name}`;
    }
    return result.error || 'PAN validation failed';
  }

  formatPAN(pan) {
    if (!pan) return '';
    return pan.replace(/[^A-Z0-9]/g, '').toUpperCase();
  }

  isValidPANFormat(pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }
}

export const panValidationService = new PANValidationService();
export default panValidationService;