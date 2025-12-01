// =====================================================
// AIS INTEGRATION HOOKS FOR BUSINESS INCOME
// React Query hooks for AIS business income integration
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessIncomeAISService } from '../services/ais-integration.service';
import { businessIncomeKeys } from './use-business-income';
import toast from 'react-hot-toast';

export const aisBusinessIncomeKeys = {
  all: ['ais-business-income'],
  businessIncome: (filingId, assessmentYear) => [...aisBusinessIncomeKeys.all, 'business-income', filingId, assessmentYear],
};

/**
 * Hook to fetch AIS business income data
 */
export function useAISBusinessIncome(filingId, assessmentYear = '2024-25') {
  return useQuery({
    queryKey: aisBusinessIncomeKeys.businessIncome(filingId, assessmentYear),
    queryFn: () => businessIncomeAISService.fetchAISBusinessIncome(filingId, assessmentYear),
    enabled: !!filingId,
    staleTime: 10 * 60 * 1000, // 10 minutes (AIS data doesn't change frequently)
  });
}

/**
 * Hook to apply AIS data to business income form
 */
export function useApplyAISBusinessIncome(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businesses) => businessIncomeAISService.applyAISData(filingId, businesses),
    onSuccess: () => {
      queryClient.invalidateQueries(businessIncomeKeys.detail(filingId));
      queryClient.invalidateQueries(aisBusinessIncomeKeys.all);
      toast.success('AIS business income data applied successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply AIS business income data');
    },
  });
}

/**
 * Hook to compare AIS data with form data
 */
export function useCompareAISWithForm(filingId, formBusinesses = []) {
  const { data: aisData, isLoading } = useAISBusinessIncome(filingId);

  return {
    comparison: aisData ? businessIncomeAISService.compareAISWithForm(aisData, formBusinesses) : null,
    isLoading,
  };
}

