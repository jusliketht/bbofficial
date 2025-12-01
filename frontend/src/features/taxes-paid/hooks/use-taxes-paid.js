// =====================================================
// TAXES PAID HOOKS
// React Query hooks for taxes paid
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxesPaidService } from '../services/taxes-paid.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for taxes paid
 */
export const taxesPaidKeys = {
  all: ['taxes-paid'],
  detail: (filingId) => [...taxesPaidKeys.all, 'detail', filingId],
  interest: (filingId) => [...taxesPaidKeys.detail(filingId), 'interest'],
};

/**
 * Hook to get taxes paid for a filing
 */
export function useTaxesPaid(filingId) {
  return useQuery({
    queryKey: taxesPaidKeys.detail(filingId),
    queryFn: () => taxesPaidService.getTaxesPaid(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update taxes paid
 */
export function useUpdateTaxesPaid(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taxesPaidData) => taxesPaidService.updateTaxesPaid(filingId, taxesPaidData),
    onSuccess: () => {
      queryClient.invalidateQueries(taxesPaidKeys.detail(filingId));
      toast.success('Taxes paid updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update taxes paid');
    },
  });
}

/**
 * Hook to generate challan
 */
export function useGenerateChallan(filingId) {
  return useMutation({
    mutationFn: (challanData) => taxesPaidService.generateChallan(filingId, challanData),
    onSuccess: () => {
      toast.success('Challan generated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate challan');
    },
  });
}

/**
 * Hook to calculate interest (234A/234B/234C)
 */
export function useInterestCalculation(filingId) {
  return useQuery({
    queryKey: taxesPaidKeys.interest(filingId),
    queryFn: () => taxesPaidService.calculateInterest(filingId),
    enabled: !!filingId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

