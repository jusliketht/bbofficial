import syncApiClient from './syncApi';

/**
 * Enhanced ITR Determination Service
 * Provides intelligent ITR type determination with confidence scoring
 * Integrates with backend enhanced ITR determination service
 */
class EnhancedITRDeterminationService {
  constructor() {
    this.baseURL = '/v2/itr';
  }

  /**
   * Determine the most appropriate ITR type with confidence scoring
   * @param {Object} userProfile - User profile data
   * @param {Object} incomeData - Income and financial data
   * @returns {Promise<Object>} ITR determination result
   */
  async determineITRType(userProfile, incomeData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseURL}/determine`, {
        userProfile,
        incomeData
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to determine ITR type');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to determine ITR type');
    }
  }

  /**
   * Validate user's ITR selection
   * @param {string} selectedITR - User selected ITR type
   * @param {Object} userProfile - User profile data
   * @param {Object} incomeData - Income data
   * @returns {Promise<Object>} Validation result
   */
  async validateITRSelection(selectedITR, userProfile, incomeData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseURL}/validate`, {
        selectedITR,
        userProfile,
        incomeData
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to validate ITR selection');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to validate ITR selection');
    }
  }

  /**
   * Get detailed rules and eligibility criteria for a specific ITR type
   * @param {string} itrType - ITR type to get rules for
   * @returns {Promise<Object>} ITR rules and criteria
   */
  async getITRRules(itrType) {
    try {
      const response = await syncApiClient.client.get(`${this.baseURL}/rules/${itrType}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get ITR rules');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get ITR rules');
    }
  }

  /**
   * Get complete eligibility matrix for all ITR types
   * @returns {Promise<Object>} Eligibility matrix
   */
  async getEligibilityMatrix() {
    try {
      const response = await syncApiClient.client.get(`${this.baseURL}/eligibility-matrix`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get eligibility matrix');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get eligibility matrix');
    }
  }

  /**
   * Format confidence score for display
   * @param {number} confidence - Confidence score (0-1)
   * @returns {Object} Formatted confidence data
   */
  formatConfidence(confidence) {
    if (confidence >= 0.8) {
      return {
        level: 'high',
        label: 'High Confidence',
        color: 'green',
        percentage: Math.round(confidence * 100)
      };
    } else if (confidence >= 0.6) {
      return {
        level: 'medium',
        label: 'Medium Confidence',
        color: 'yellow',
        percentage: Math.round(confidence * 100)
      };
    } else if (confidence >= 0.4) {
      return {
        level: 'low',
        label: 'Low Confidence',
        color: 'orange',
        percentage: Math.round(confidence * 100)
      };
    } else {
      return {
        level: 'very-low',
        label: 'Very Low Confidence',
        color: 'red',
        percentage: Math.round(confidence * 100)
      };
    }
  }

  /**
   * Generate user-friendly recommendations based on determination result
   * @param {Object} determinationResult - Result from determineITRType
   * @returns {Object} User-friendly recommendations
   */
  generateRecommendations(determinationResult) {
    const { recommendedITR, confidence, alternatives, warnings, suggestions } = determinationResult.data;

    return {
      primary: {
        itrType: recommendedITR,
        confidence: this.formatConfidence(confidence),
        reasoning: determinationResult.data.reasoning || []
      },
      alternatives: alternatives.map(alt => ({
        itrType: alt.itrType,
        confidence: this.formatConfidence(alt.confidence),
        reasoning: alt.reasoning
      })),
      warnings: warnings.map(warning => ({
        type: warning.type,
        message: warning.message,
        severity: warning.severity,
        icon: this.getWarningIcon(warning.severity)
      })),
      suggestions: suggestions.map(suggestion => ({
        type: suggestion.type,
        message: suggestion.message,
        priority: suggestion.priority,
        icon: this.getSuggestionIcon(suggestion.type)
      }))
    };
  }

  /**
   * Get appropriate icon for warning severity
   * @param {string} severity - Warning severity level
   * @returns {string} Icon name
   */
  getWarningIcon(severity) {
    const icons = {
      high: 'AlertTriangle',
      medium: 'Info',
      low: 'MessageSquare'
    };
    return icons[severity] || 'Info';
  }

  /**
   * Get appropriate icon for suggestion type
   * @param {string} type - Suggestion type
   * @returns {string} Icon name
   */
  getSuggestionIcon(type) {
    const icons = {
      tax_regime: 'Calculator',
      deductions: 'DollarSign',
      presumptive: 'TrendingUp',
      compliance: 'Shield'
    };
    return icons[type] || 'Info';
  }
}

// Create singleton instance
const enhancedITRDeterminationService = new EnhancedITRDeterminationService();

export default enhancedITRDeterminationService;
