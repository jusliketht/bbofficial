// =====================================================
// SALARY HOOKS
// React Query hooks for salary income
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '../services/salary.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for salary
 */
export const salaryKeys = {
  all: ['salary'],
  detail: (filingId) => [...salaryKeys.all, 'detail', filingId],
  employers: (filingId) => [...salaryKeys.detail(filingId), 'employers'],
};

/**
 * Hook to get salary income for a filing
 */
export function useSalary(filingId) {
  return useQuery({
    queryKey: salaryKeys.detail(filingId),
    queryFn: () => salaryService.getSalary(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update salary income
 */
export function useUpdateSalary(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salaryData) => salaryService.updateSalary(filingId, salaryData),
    onSuccess: () => {
      queryClient.invalidateQueries(salaryKeys.detail(filingId));
      toast.success('Salary income updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update salary income');
    },
  });
}

/**
 * Hook to add employer
 */
export function useAddEmployer(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employerData) => salaryService.addEmployer(filingId, employerData),
    onSuccess: () => {
      queryClient.invalidateQueries(salaryKeys.employers(filingId));
      toast.success('Employer added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add employer');
    },
  });
}

/**
 * Hook to calculate HRA exemption
 */
export function useHRACalculation() {
  return useMutation({
    mutationFn: (hraData) => salaryService.calculateHRAExemption(hraData),
  });
}

