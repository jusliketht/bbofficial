// =====================================================
// HOUSE PROPERTY HOOKS
// React Query hooks for house property income
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housePropertyService } from '../services/house-property.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for house property
 */
export const housePropertyKeys = {
  all: ['house-property'],
  detail: (filingId) => [...housePropertyKeys.all, 'detail', filingId],
  properties: (filingId) => [...housePropertyKeys.detail(filingId), 'properties'],
};

/**
 * Hook to get house property income for a filing
 */
export function useHouseProperty(filingId) {
  return useQuery({
    queryKey: housePropertyKeys.detail(filingId),
    queryFn: () => housePropertyService.getHouseProperty(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update house property income
 */
export function useUpdateHouseProperty(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (housePropertyData) => housePropertyService.updateHouseProperty(filingId, housePropertyData),
    onSuccess: () => {
      queryClient.invalidateQueries(housePropertyKeys.detail(filingId));
      toast.success('House property income updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update house property income');
    },
  });
}

/**
 * Hook to add property
 */
export function useAddProperty(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData) => housePropertyService.addProperty(filingId, propertyData),
    onSuccess: () => {
      queryClient.invalidateQueries(housePropertyKeys.properties(filingId));
      toast.success('Property added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add property');
    },
  });
}

/**
 * Hook to calculate pre-construction interest
 */
export function usePreConstructionInterest() {
  return useMutation({
    mutationFn: (preConstructionData) => housePropertyService.calculatePreConstructionInterest(preConstructionData),
  });
}

/**
 * Hook to calculate property income
 */
export function usePropertyIncomeCalculation() {
  return useMutation({
    mutationFn: (propertyData) => housePropertyService.calculatePropertyIncome(propertyData),
  });
}

