// =====================================================
// PREVIOUS YEAR COPY HOOKS
// React Query hooks for previous year copy operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import previousYearService from '../services/previous-year.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for previous year copy
 */
export const previousYearKeys = {
  all: ['previous-year'],
  availableYears: (userId, memberId) => [...previousYearKeys.all, 'available-years', userId, memberId],
  data: (filingId) => [...previousYearKeys.all, 'data', filingId],
};

/**
 * Hook to fetch available previous year filings
 * @param {string} userId - User ID
 * @param {string} memberId - Member ID (optional)
 * @param {string} currentAssessmentYear - Current assessment year
 * @returns {object} Query result with available previous years
 */
export function useAvailablePreviousYears(userId, memberId = null, currentAssessmentYear = '2024-25') {
  return useQuery({
    queryKey: previousYearKeys.availableYears(userId, memberId),
    queryFn: async () => {
      const result = await previousYearService.getAvailablePreviousYears(
        userId,
        memberId,
        currentAssessmentYear,
      );
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch previous years');
      }
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch previous year data for preview
 * @param {string} filingId - Previous year filing ID
 * @returns {object} Query result with previous year data
 */
export function usePreviousYearData(filingId) {
  return useQuery({
    queryKey: previousYearKeys.data(filingId),
    queryFn: async () => {
      const result = await previousYearService.getPreviousYearData(filingId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch previous year data');
      }
      return result.data;
    },
    enabled: !!filingId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to copy data from previous year to current filing
 * @returns {object} Mutation object
 */
export function useCopyFromPreviousYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetFilingId, sourceFilingId, sections, reviewData }) =>
      previousYearService.copyFromPreviousYear(targetFilingId, sourceFilingId, sections, reviewData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['itr', 'filings', variables.targetFilingId]);
      queryClient.invalidateQueries(['itr', 'drafts', variables.targetFilingId]);
      queryClient.invalidateQueries(previousYearKeys.availableYears());

      toast.success('Data copied successfully from previous year!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to copy from previous year');
    },
  });
}

