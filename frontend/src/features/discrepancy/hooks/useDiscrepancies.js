// =====================================================
// USE DISCREPANCIES HOOK
// React Query hook for fetching and mutating discrepancies
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/core/APIClient';

/**
 * Hook for fetching discrepancies
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with discrepancies data
 */
export const useDiscrepancies = (filingId) => {
  return useQuery({
    queryKey: ['discrepancies', filingId],
    queryFn: async () => {
      if (!filingId) return null;
      const response = await apiClient.get(`/itr/filings/${filingId}/discrepancies`);
      return response.data;
    },
    enabled: !!filingId,
  });
};

/**
 * Hook for resolving a single discrepancy
 * @param {string} filingId - Filing ID
 * @returns {object} Mutation object
 */
export const useResolveDiscrepancy = (filingId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discrepancyId, fieldPath, resolutionAction, resolvedValue, explanation, discrepancy }) => {
      const response = await apiClient.post(`/itr/filings/${filingId}/discrepancies/resolve`, {
        discrepancyId,
        fieldPath,
        resolutionAction,
        resolvedValue,
        explanation,
        discrepancy,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discrepancies', filingId]);
      queryClient.invalidateQueries(['discrepancy-history', filingId]);
    },
  });
};

/**
 * Hook for bulk resolving discrepancies
 * @param {string} filingId - Filing ID
 * @returns {object} Mutation object
 */
export const useBulkResolveDiscrepancies = (filingId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discrepancyIds, resolutionAction, resolvedValue, explanation }) => {
      const response = await apiClient.post(`/itr/filings/${filingId}/discrepancies/bulk-resolve`, {
        discrepancyIds,
        resolutionAction,
        resolvedValue,
        explanation,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discrepancies', filingId]);
      queryClient.invalidateQueries(['discrepancy-history', filingId]);
    },
  });
};

/**
 * Hook for fetching discrepancy suggestions
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with suggestions
 */
export const useDiscrepancySuggestions = (filingId) => {
  return useQuery({
    queryKey: ['discrepancy-suggestions', filingId],
    queryFn: async () => {
      if (!filingId) return null;
      const response = await apiClient.get(`/itr/filings/${filingId}/discrepancies/suggestions`);
      return response.data;
    },
    enabled: !!filingId,
  });
};

/**
 * Hook for fetching discrepancy history
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with history
 */
export const useDiscrepancyHistory = (filingId) => {
  return useQuery({
    queryKey: ['discrepancy-history', filingId],
    queryFn: async () => {
      if (!filingId) return null;
      const response = await apiClient.get(`/itr/filings/${filingId}/discrepancies/history`);
      return response.data;
    },
    enabled: !!filingId,
  });
};

