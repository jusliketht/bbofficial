// =====================================================
// BUSINESS INCOME HOOKS
// React Query hooks for business income
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessIncomeService } from '../services/business-income.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for business income
 */
export const businessIncomeKeys = {
  all: ['business-income'],
  detail: (filingId) => [...businessIncomeKeys.all, 'detail', filingId],
  businesses: (filingId) => [...businessIncomeKeys.detail(filingId), 'businesses'],
};

/**
 * Hook to get business income for a filing
 */
export function useBusinessIncome(filingId) {
  return useQuery({
    queryKey: businessIncomeKeys.detail(filingId),
    queryFn: () => businessIncomeService.getBusinessIncome(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update business income
 */
export function useUpdateBusinessIncome(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessIncomeData) => businessIncomeService.updateBusinessIncome(filingId, businessIncomeData),
    onSuccess: () => {
      queryClient.invalidateQueries(businessIncomeKeys.detail(filingId));
      toast.success('Business income updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update business income');
    },
  });
}

/**
 * Hook to calculate presumptive tax
 */
export function usePresumptiveTaxCalculation() {
  return useMutation({
    mutationFn: (businessData) => businessIncomeService.calculatePresumptiveTax(businessData),
  });
}

/**
 * Hook to calculate net profit
 */
export function useNetProfitCalculation() {
  return useMutation({
    mutationFn: (pnlData) => businessIncomeService.calculateNetProfit(pnlData),
  });
}

