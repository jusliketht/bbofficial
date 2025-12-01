// =====================================================
// AIS INTEGRATION HOOKS FOR PROFESSIONAL INCOME
// React Query hooks for AIS professional income integration
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalIncomeAISService } from '../services/ais-integration.service';
import { professionalIncomeKeys } from './use-professional-income';
import toast from 'react-hot-toast';

export const aisProfessionalIncomeKeys = {
  all: ['ais-professional-income'],
  professionalIncome: (filingId, assessmentYear) => [...aisProfessionalIncomeKeys.all, 'professional-income', filingId, assessmentYear],
};

/**
 * Hook to fetch AIS professional income data
 */
export function useAISProfessionalIncome(filingId, assessmentYear = '2024-25') {
  return useQuery({
    queryKey: aisProfessionalIncomeKeys.professionalIncome(filingId, assessmentYear),
    queryFn: () => professionalIncomeAISService.fetchAISProfessionalIncome(filingId, assessmentYear),
    enabled: !!filingId,
    staleTime: 10 * 60 * 1000, // 10 minutes (AIS data doesn't change frequently)
  });
}

/**
 * Hook to apply AIS data to professional income form
 */
export function useApplyAISProfessionalIncome(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professions) => professionalIncomeAISService.applyAISData(filingId, professions),
    onSuccess: () => {
      queryClient.invalidateQueries(professionalIncomeKeys.detail(filingId));
      queryClient.invalidateQueries(aisProfessionalIncomeKeys.all);
      toast.success('AIS professional income data applied successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply AIS professional income data');
    },
  });
}

/**
 * Hook to compare AIS data with form data
 */
export function useCompareAISWithForm(filingId, formProfessions = []) {
  const { data: aisData, isLoading } = useAISProfessionalIncome(filingId);

  return {
    comparison: aisData ? professionalIncomeAISService.compareAISWithForm(aisData, formProfessions) : null,
    isLoading,
  };
}

