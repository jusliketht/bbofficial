// =====================================================
// PROFESSIONAL INCOME HOOKS
// React Query hooks for professional income
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalIncomeService } from '../services/professional-income.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for professional income
 */
export const professionalIncomeKeys = {
  all: ['professional-income'],
  detail: (filingId) => [...professionalIncomeKeys.all, 'detail', filingId],
  activities: (filingId) => [...professionalIncomeKeys.detail(filingId), 'activities'],
};

/**
 * Hook to get professional income for a filing
 */
export function useProfessionalIncome(filingId) {
  return useQuery({
    queryKey: professionalIncomeKeys.detail(filingId),
    queryFn: () => professionalIncomeService.getProfessionalIncome(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update professional income
 */
export function useUpdateProfessionalIncome(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionalIncomeData) => professionalIncomeService.updateProfessionalIncome(filingId, professionalIncomeData),
    onSuccess: () => {
      queryClient.invalidateQueries(professionalIncomeKeys.detail(filingId));
      toast.success('Professional income updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update professional income');
    },
  });
}

/**
 * Hook to calculate net income
 */
export function useNetIncomeCalculation() {
  return useMutation({
    mutationFn: (activityData) => professionalIncomeService.calculateNetIncome(activityData),
  });
}

