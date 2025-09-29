// taxComputation Service
// Handles tax computation logic and API calls

import { apiService } from './apiService';

class TaxComputationService {
  constructor() {
    this.baseUrl = '/tax';
  }

  async computeTax(taxData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/compute`, taxData);
      return response.data;
    } catch (error) {
      console.error('Tax computation failed:', error);
      throw error;
    }
  }

  async getTaxRegimes() {
    try {
      const response = await apiService.get(`${this.baseUrl}/regimes`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tax regimes:', error);
      throw error;
    }
  }

  async getTaxSlabs(regime) {
    try {
      const response = await apiService.get(`${this.baseUrl}/slabs/${regime}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tax slabs:', error);
      throw error;
    }
  }

  async calculateAdvanceTax(taxData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/advance`, taxData);
      return response.data;
    } catch (error) {
      console.error('Advance tax calculation failed:', error);
      throw error;
    }
  }

  async getTaxSummary(taxData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/summary`, taxData);
      return response.data;
    } catch (error) {
      console.error('Tax summary generation failed:', error);
      throw error;
    }
  }
}

export const taxComputationService = new TaxComputationService();
export default taxComputationService;
