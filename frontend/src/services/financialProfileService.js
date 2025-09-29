import apiClient from './api';
import enterpriseDebugger from './EnterpriseDebugger';

class FinancialProfileService {
  constructor() {
    this.serviceName = 'FinancialProfileService';
    this.baseUrl = '/api/v2/financial-profile';
  }

  /**
   * Get financial profile data for a PAN
   * @param {string} pan - PAN number
   * @returns {Promise<Object>} Financial profile data
   */
  async getFinancialProfile(pan) {
    try {
      enterpriseDebugger.log('INFO', this.serviceName, 'Fetching financial profile', {
        pan: pan || 'N/A'
      });

      const response = await apiClient.get(`${this.baseUrl}/${pan}`);
      
      enterpriseDebugger.log('SUCCESS', this.serviceName, 'Financial profile fetched', {
        pan: pan || 'N/A',
        dataKeys: Object.keys(response.data.data || {})
      });

      return response.data;
    } catch (error) {
      enterpriseDebugger.log('ERROR', this.serviceName, 'Failed to fetch financial profile', {
        error: error.message,
        pan: pan || 'N/A',
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Generate financial insights for a PAN
   * @param {string} pan - PAN number
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<Object>} Financial insights
   */
  async generateInsights(pan, assessmentYear = '2023-24') {
    try {
      enterpriseDebugger.log('INFO', this.serviceName, 'Generating financial insights', {
        pan: pan || 'N/A',
        assessmentYear
      });

      const response = await apiClient.post(`${this.baseUrl}/${pan}/insights`, {
        assessmentYear
      });
      
      enterpriseDebugger.log('SUCCESS', this.serviceName, 'Financial insights generated', {
        pan: pan || 'N/A',
        insightsCount: response.data.data?.length || 0
      });

      return response.data;
    } catch (error) {
      enterpriseDebugger.log('ERROR', this.serviceName, 'Failed to generate insights', {
        error: error.message,
        pan: pan || 'N/A',
        assessmentYear,
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Get filing history for a PAN
   * @param {string} pan - PAN number
   * @returns {Promise<Object>} Filing history
   */
  async getFilingHistory(pan) {
    try {
      enterpriseDebugger.log('INFO', this.serviceName, 'Fetching filing history', {
        pan: pan || 'N/A'
      });

      const response = await apiClient.get(`${this.baseUrl}/${pan}/history`);
      
      enterpriseDebugger.log('SUCCESS', this.serviceName, 'Filing history fetched', {
        pan: pan || 'N/A',
        historyCount: response.data.data?.length || 0
      });

      return response.data;
    } catch (error) {
      enterpriseDebugger.log('ERROR', this.serviceName, 'Failed to fetch filing history', {
        error: error.message,
        pan: pan || 'N/A',
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Calculate compliance score based on financial data
   * @param {Object} financialData - Financial profile data
   * @returns {number} Compliance score (0-100)
   */
  calculateComplianceScore(financialData) {
    try {
      let score = 0;
      const maxScore = 100;

      // Filing consistency (40 points)
      if (financialData.refundHistory && financialData.refundHistory.length >= 3) {
        score += 40;
      } else if (financialData.refundHistory && financialData.refundHistory.length >= 2) {
        score += 30;
      } else if (financialData.refundHistory && financialData.refundHistory.length >= 1) {
        score += 20;
      }

      // Income growth trend (30 points)
      if (financialData.incomeTrends && financialData.incomeTrends.length >= 2) {
        const latestGrowth = financialData.incomeTrends[0]?.growth || 0;
        if (latestGrowth > 10) {
          score += 30;
        } else if (latestGrowth > 5) {
          score += 20;
        } else if (latestGrowth > 0) {
          score += 10;
        }
      }

      // Deduction utilization (20 points)
      if (financialData.deductionUtilization) {
        const avgUtilization = financialData.deductionUtilization.reduce(
          (sum, deduction) => sum + deduction.utilization, 0
        ) / financialData.deductionUtilization.length;
        
        if (avgUtilization >= 90) {
          score += 20;
        } else if (avgUtilization >= 70) {
          score += 15;
        } else if (avgUtilization >= 50) {
          score += 10;
        }
      }

      // Anomaly detection (10 points)
      if (financialData.anomalies) {
        const warningAnomalies = financialData.anomalies.filter(a => a.type === 'warning');
        if (warningAnomalies.length === 0) {
          score += 10;
        } else if (warningAnomalies.length <= 1) {
          score += 5;
        }
      }

      enterpriseDebugger.log('INFO', this.serviceName, 'Compliance score calculated', {
        score,
        maxScore,
        components: {
          filingConsistency: financialData.refundHistory?.length || 0,
          incomeGrowth: financialData.incomeTrends?.[0]?.growth || 0,
          deductionUtilization: financialData.deductionUtilization?.length || 0,
          anomalies: financialData.anomalies?.length || 0
        }
      });

      return Math.min(score, maxScore);
    } catch (error) {
      enterpriseDebugger.log('ERROR', this.serviceName, 'Failed to calculate compliance score', {
        error: error.message
      });
      return 0;
    }
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get risk level based on compliance score
   * @param {number} score - Compliance score
   * @returns {Object} Risk level information
   */
  getRiskLevel(score) {
    if (score >= 90) {
      return {
        level: 'low',
        label: 'Excellent',
        color: 'green',
        description: 'Strong compliance record'
      };
    } else if (score >= 70) {
      return {
        level: 'medium',
        label: 'Good',
        color: 'yellow',
        description: 'Good compliance with room for improvement'
      };
    } else {
      return {
        level: 'high',
        label: 'Needs Attention',
        color: 'red',
        description: 'Compliance issues detected'
      };
    }
  }
}

const financialProfileService = new FinancialProfileService();
export default financialProfileService;
