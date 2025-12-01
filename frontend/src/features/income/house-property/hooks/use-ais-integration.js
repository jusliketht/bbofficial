// =====================================================
// AIS INTEGRATION HOOKS FOR HOUSE PROPERTY
// React Query hooks for AIS rental income integration
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housePropertyAISService } from '../services/ais-integration.service';
import { housePropertyKeys } from './use-house-property';
import toast from 'react-hot-toast';

export const aisHousePropertyKeys = {
  all: ['ais-house-property'],
  rentalIncome: (filingId, assessmentYear) => [...aisHousePropertyKeys.all, 'rental-income', filingId, assessmentYear],
};

/**
 * Hook to fetch AIS rental income data
 */
export function useAISRentalIncome(filingId, assessmentYear = '2024-25') {
  return useQuery({
    queryKey: aisHousePropertyKeys.rentalIncome(filingId, assessmentYear),
    queryFn: () => housePropertyAISService.fetchAISRentalIncome(filingId, assessmentYear),
    enabled: !!filingId,
    staleTime: 10 * 60 * 1000, // 10 minutes (AIS data doesn't change frequently)
  });
}

/**
 * Hook to apply AIS data to house property form
 */
export function useApplyAISRentalIncome(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (properties) => housePropertyAISService.applyAISData(filingId, properties),
    onSuccess: () => {
      queryClient.invalidateQueries(housePropertyKeys.detail(filingId));
      queryClient.invalidateQueries(aisHousePropertyKeys.all);
      toast.success('AIS rental income data applied successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply AIS rental income data');
    },
  });
}

/**
 * Hook to compare AIS data with form data
 */
export function useCompareAISWithForm(filingId, formProperties = []) {
  const { data: aisData } = useAISRentalIncome(filingId);

  return useQuery({
    queryKey: [...aisHousePropertyKeys.all, 'compare', filingId, formProperties],
    queryFn: () => {
      if (!aisData?.rentalIncome) {
        return {
          matches: [],
          discrepancies: [],
          summary: { totalAISProperties: 0, totalFormProperties: formProperties.length, matches: 0, discrepancies: 0 },
        };
      }

      const mappedProperties = housePropertyAISService.mapAISToHouseProperty(aisData);
      return housePropertyAISService.compareWithFormData(mappedProperties, formProperties);
    },
    enabled: !!aisData && formProperties.length >= 0,
    staleTime: 5 * 60 * 1000,
  });
}

