// =====================================================
// TAX OPTIMIZER HOOKS
// React Query hooks for tax optimization operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxSimulationService from '../services/tax-simulation.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for tax optimizer
 */
export const taxOptimizerKeys = {
  all: ['tax-optimizer'],
  filing: (filingId) => [...taxOptimizerKeys.all, 'filing', filingId],
  opportunities: (filingId) => [...taxOptimizerKeys.filing(filingId), 'opportunities'],
};

/**
 * Hook to get optimization opportunities
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with opportunities
 */
export function useOptimizationOpportunities(filingId) {
  return useQuery({
    queryKey: taxOptimizerKeys.opportunities(filingId),
    queryFn: async () => {
      const result = await taxSimulationService.getOptimizationOpportunities(filingId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch optimization opportunities');
      }
      return result;
    },
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to simulate a tax scenario
 * @returns {object} Mutation object
 */
export function useSimulateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, scenario }) =>
      taxSimulationService.simulateScenario(filingId, scenario),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxOptimizerKeys.filing(variables.filingId));
      if (data.success) {
        toast.success('Scenario simulated successfully!');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to simulate scenario');
    },
  });
}

/**
 * Hook to compare multiple scenarios
 * @returns {object} Mutation object
 */
export function useCompareScenarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, scenarios }) =>
      taxSimulationService.compareScenarios(filingId, scenarios),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxOptimizerKeys.filing(variables.filingId));
      if (data.success) {
        toast.success('Scenarios compared successfully!');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to compare scenarios');
    },
  });
}

/**
 * Hook to apply simulation to actual filing
 * @returns {object} Mutation object
 */
export function useApplySimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, scenarioId, changes }) =>
      taxSimulationService.applySimulation(filingId, scenarioId, changes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxOptimizerKeys.filing(variables.filingId));
      // Also invalidate filing data queries
      queryClient.invalidateQueries(['itr-filings', variables.filingId]);
      if (data.success) {
        toast.success('Simulation applied successfully!');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply simulation');
    },
  });
}

