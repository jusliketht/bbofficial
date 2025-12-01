// =====================================================
// CAPITAL GAINS HOOKS
// React Query hooks for capital gains income
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { capitalGainsService } from '../services/capital-gains.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for capital gains
 */
export const capitalGainsKeys = {
  all: ['capital-gains'],
  detail: (filingId) => [...capitalGainsKeys.all, 'detail', filingId],
  stcg: (filingId) => [...capitalGainsKeys.detail(filingId), 'stcg'],
  ltcg: (filingId) => [...capitalGainsKeys.detail(filingId), 'ltcg'],
};

/**
 * Hook to get capital gains income for a filing
 */
export function useCapitalGains(filingId) {
  return useQuery({
    queryKey: capitalGainsKeys.detail(filingId),
    queryFn: () => capitalGainsService.getCapitalGains(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update capital gains income
 */
export function useUpdateCapitalGains(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capitalGainsData) => capitalGainsService.updateCapitalGains(filingId, capitalGainsData),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.detail(filingId));
      toast.success('Capital gains income updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update capital gains income');
    },
  });
}

/**
 * Hook to calculate capital gains
 */
export function useCalculateCapitalGains() {
  return useMutation({
    mutationFn: (entryData) => capitalGainsService.calculateCapitalGains(entryData),
  });
}

/**
 * Hook to get tax harvesting suggestions
 */
export function useTaxHarvestingSuggestions() {
  return useMutation({
    mutationFn: ({ stcgEntries, ltcgEntries, lossEntries }) =>
      capitalGainsService.suggestTaxHarvesting(stcgEntries, ltcgEntries, lossEntries),
  });
}

/**
 * Hook to add STCG entry
 */
export function useAddSTCGEntry(filingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryData) => capitalGainsService.addSTCGEntry(filingId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.stcg(filingId));
      toast.success('STCG entry added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add STCG entry');
    },
  });
}

/**
 * Hook to remove STCG entry
 */
export function useRemoveSTCGEntry(filingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => capitalGainsService.removeSTCGEntry(filingId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.stcg(filingId));
      toast.success('STCG entry removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove STCG entry');
    },
  });
}

/**
 * Hook to add LTCG entry
 */
export function useAddLTCGEntry(filingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryData) => capitalGainsService.addLTCGEntry(filingId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.ltcg(filingId));
      toast.success('LTCG entry added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add LTCG entry');
    },
  });
}

/**
 * Hook to remove LTCG entry
 */
export function useRemoveLTCGEntry(filingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => capitalGainsService.removeLTCGEntry(filingId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.ltcg(filingId));
      toast.success('LTCG entry removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove LTCG entry');
    },
  });
}

