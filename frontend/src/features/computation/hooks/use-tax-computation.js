// =====================================================
// TAX COMPUTATION HOOKS
// React Query hooks for tax computation with debouncing
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../hooks/useDebounce';
import { useState, useEffect } from 'react';
import { computationService } from '../services/computation.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for tax computation
 */
export const computationKeys = {
  all: ['computation'],
  detail: (filingId) => [...computationKeys.all, 'detail', filingId],
  regimes: (filingId) => [...computationKeys.detail(filingId), 'regimes'],
  regime: (filingId, regime) => [...computationKeys.regimes(filingId), regime],
  breakdown: (filingId) => [...computationKeys.detail(filingId), 'breakdown'],
};

/**
 * Hook for tax computation with real-time debounced updates
 */
export function useTaxComputation(filingId, formData, enabled = true) {
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  const debouncedData = useDebounce(formData, 300); // 300ms debounce

  useEffect(() => {
    setDebouncedFormData(debouncedData);
  }, [debouncedData]);

  return useQuery({
    queryKey: computationKeys.detail(filingId),
    queryFn: () => computationService.computeTax(filingId, debouncedFormData),
    enabled: enabled && !!filingId && !!debouncedFormData,
    staleTime: 0, // Always recompute when data changes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for regime comparison
 */
export function useRegimeComparison(filingId, formData) {
  return useQuery({
    queryKey: computationKeys.regimes(filingId),
    queryFn: () => computationService.compareRegimes(filingId, formData),
    enabled: !!filingId && !!formData,
    staleTime: 0,
  });
}

/**
 * Hook for slab-wise tax breakdown
 */
export function useTaxBreakdown(filingId, regime = 'old') {
  return useQuery({
    queryKey: computationKeys.breakdown(filingId),
    queryFn: () => computationService.getTaxBreakdown(filingId, regime),
    enabled: !!filingId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to calculate interest (234A/234B/234C)
 */
export function useInterestCalculation(filingId, formData) {
  return useMutation({
    mutationFn: (params) =>
      computationService.calculateInterest(filingId, {
        ...params,
        formData,
      }),
    onError: (error) => {
      toast.error(error.message || 'Interest calculation failed');
    },
  });
}

