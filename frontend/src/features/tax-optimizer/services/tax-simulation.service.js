// =====================================================
// TAX SIMULATION SERVICE
// Frontend service for tax simulation operations
// =====================================================

import apiClient from '../../../services/core/APIClient';

class TaxSimulationService {
  /**
   * Simulate a tax-saving scenario
   * @param {string} filingId - Filing ID
   * @param {object} scenario - Simulation scenario
   * @returns {Promise<object>} - Simulation results
   */
  async simulateScenario(filingId, scenario) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/simulate`,
        { scenario },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to simulate scenario:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to simulate scenario',
      };
    }
  }

  /**
   * Compare multiple scenarios
   * @param {string} filingId - Filing ID
   * @param {Array} scenarios - Array of scenarios to compare
   * @returns {Promise<object>} - Comparison results
   */
  async compareScenarios(filingId, scenarios) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/compare-scenarios`,
        { scenarios },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to compare scenarios:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to compare scenarios',
      };
    }
  }

  /**
   * Apply simulation to actual filing
   * @param {string} filingId - Filing ID
   * @param {string} scenarioId - Scenario ID
   * @param {object} changes - Changes to apply
   * @returns {Promise<object>} - Application result
   */
  async applySimulation(filingId, scenarioId, changes) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/apply-simulation`,
        { scenarioId, changes },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to apply simulation:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to apply simulation',
      };
    }
  }

  /**
   * Get optimization opportunities
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Optimization opportunities
   */
  async getOptimizationOpportunities(filingId) {
    try {
      const response = await apiClient.get(
        `/api/itr/filings/${filingId}/optimization-opportunities`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get optimization opportunities:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get optimization opportunities',
        opportunities: [],
      };
    }
  }
}

export default new TaxSimulationService();

