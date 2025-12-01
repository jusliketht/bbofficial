// =====================================================
// AIS INTEGRATION HOOKS FOR CAPITAL GAINS
// React Query hooks for AIS capital gains integration
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { capitalGainsAISService } from '../services/ais-integration.service';
import { capitalGainsKeys } from './use-capital-gains';
import toast from 'react-hot-toast';

export const aisCapitalGainsKeys = {
  all: ['ais-capital-gains'],
  capitalGains: (filingId, assessmentYear) => [...aisCapitalGainsKeys.all, 'capital-gains', filingId, assessmentYear],
};

/**
 * Hook to fetch AIS capital gains data
 */
export function useAISCapitalGains(filingId, assessmentYear = '2024-25') {
  return useQuery({
    queryKey: aisCapitalGainsKeys.capitalGains(filingId, assessmentYear),
    queryFn: () => capitalGainsAISService.fetchAISCapitalGains(filingId, assessmentYear),
    enabled: !!filingId,
    staleTime: 10 * 60 * 1000, // 10 minutes (AIS data doesn't change frequently)
  });
}

/**
 * Hook to apply AIS data to capital gains form
 */
export function useApplyAISCapitalGains(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stcgEntries, ltcgEntries }) =>
      capitalGainsAISService.applyAISData(filingId, stcgEntries, ltcgEntries),
    onSuccess: () => {
      queryClient.invalidateQueries(capitalGainsKeys.detail(filingId));
      queryClient.invalidateQueries(aisCapitalGainsKeys.all);
      toast.success('AIS capital gains data applied successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply AIS capital gains data');
    },
  });
}

/**
 * Hook to compare AIS data with form data
 */
export function useCompareAISWithForm(filingId, formSTCG = [], formLTCG = []) {
  const { data: aisData } = useAISCapitalGains(filingId);

  return useQuery({
    queryKey: [...aisCapitalGainsKeys.all, 'compare', filingId, formSTCG, formLTCG],
    queryFn: () => {
      if (!aisData?.capitalGains) {
        return {
          matches: [],
          discrepancies: [],
          summary: {
            totalAISSTCG: 0,
            totalAISLTCG: 0,
            totalFormSTCG: formSTCG.length,
            totalFormLTCG: formLTCG.length,
            matches: 0,
            discrepancies: 0,
          },
        };
      }

      const mappedData = capitalGainsAISService.mapAISToCapitalGains(aisData);
      return capitalGainsAISService.compareWithFormData(
        mappedData.stcgEntries,
        mappedData.ltcgEntries,
        formSTCG,
        formLTCG,
      );
    },
    enabled: !!aisData && formSTCG.length >= 0 && formLTCG.length >= 0,
    staleTime: 5 * 60 * 1000,
  });
}

