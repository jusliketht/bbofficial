// Justification: Frontend Eligibility Service - Client-side eligibility management
// Provides eligibility evaluation, ITR type determination, and rails switching
// Essential for dynamic ITR type management and compliance
// Supports eligibility evaluation, ITR type switching, and compliance checking

import api from './api';

class EligibilityService {
  // Justification: Evaluate Eligibility - Check filing eligibility
  // Provides eligibility evaluation functionality
  // Essential for ITR type determination and compliance
  async evaluateEligibility(filingId, intakeData, currentItrType) {
    try {
      const response = await api.post('/eligibility/evaluate', {
        filingId,
        intakeData,
        currentItrType
      });
      
      if (response.data.success) {
        return {
          evaluation: response.data.data.evaluation,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to evaluate eligibility');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to evaluate eligibility');
    }
  }

  // Justification: Get ITR Eligibility Rules - Retrieve ITR eligibility rules
  // Provides ITR eligibility rules information
  // Essential for understanding ITR type requirements
  async getItrEligibilityRules(itrType) {
    try {
      const response = await api.get(`/eligibility/rules/${itrType}`);
      
      if (response.data.success) {
        return {
          rules: response.data.data.rules,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get ITR eligibility rules');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get ITR eligibility rules');
    }
  }

  // Justification: Determine ITR Type - Determine appropriate ITR type
  // Provides ITR type determination functionality
  // Essential for automatic ITR type selection
  async determineItrType(intakeData) {
    try {
      const response = await api.post('/eligibility/determine-itr', { intakeData });
      
      if (response.data.success) {
        return {
          recommendedItrType: response.data.data.recommendedItrType,
          reasoning: response.data.data.reasoning,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to determine ITR type');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to determine ITR type');
    }
  }

  // Justification: Validate ITR Eligibility - Validate ITR type eligibility
  // Provides ITR type validation functionality
  // Essential for compliance checking
  async validateItrEligibility(filingId, itrType) {
    try {
      const response = await api.post(`/eligibility/validate/${filingId}`, { itrType });
      
      if (response.data.success) {
        return {
          validation: response.data.data.validation,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to validate ITR eligibility');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to validate ITR eligibility');
    }
  }

  // Justification: Get Rails Switches - Get available ITR type switches
  // Provides ITR type switching options
  // Essential for dynamic ITR type management
  async getRailsSwitches(filingId, currentItrType) {
    try {
      const response = await api.get(`/eligibility/rails-switches/${filingId}?currentItrType=${currentItrType}`);
      
      if (response.data.success) {
        return {
          switches: response.data.data.switches,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get rails switches');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get rails switches');
    }
  }

  // Justification: Switch ITR Type - Switch to different ITR type
  // Provides ITR type switching functionality
  // Essential for dynamic ITR type management
  async switchItrType(filingId, newItrType, reason) {
    try {
      const response = await api.post(`/eligibility/switch/${filingId}`, {
        newItrType,
        reason
      });
      
      if (response.data.success) {
        return {
          filing: response.data.data.filing,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to switch ITR type');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to switch ITR type');
    }
  }

  // Justification: Get Eligibility Status - Get current eligibility status
  // Provides eligibility status information
  // Essential for status tracking and monitoring
  async getEligibilityStatus(filingId) {
    try {
      const response = await api.get(`/eligibility/status/${filingId}`);
      
      if (response.data.success) {
        return {
          status: response.data.data.status,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get eligibility status');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get eligibility status');
    }
  }

  // Justification: Get Compliance Issues - Get compliance issues
  // Provides compliance issue identification
  // Essential for compliance management
  async getComplianceIssues(filingId) {
    try {
      const response = await api.get(`/eligibility/compliance/${filingId}`);
      
      if (response.data.success) {
        return {
          issues: response.data.data.issues,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get compliance issues');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get compliance issues');
    }
  }

  // Justification: Get Eligibility History - Get eligibility evaluation history
  // Provides eligibility history tracking
  // Essential for audit and compliance
  async getEligibilityHistory(filingId) {
    try {
      const response = await api.get(`/eligibility/history/${filingId}`);
      
      if (response.data.success) {
        return {
          history: response.data.data.history,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get eligibility history');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get eligibility history');
    }
  }

  // Justification: Get ITR Type Comparison - Compare ITR types
  // Provides ITR type comparison functionality
  // Essential for ITR type selection
  async getItrTypeComparison(intakeData) {
    try {
      const response = await api.post('/eligibility/compare-itr-types', { intakeData });
      
      if (response.data.success) {
        return {
          comparison: response.data.data.comparison,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to compare ITR types');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to compare ITR types');
    }
  }
}

export const eligibilityService = new EligibilityService();
