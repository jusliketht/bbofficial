// =====================================================
// USE BALANCE SHEET HOOK
// React Query hook for balance sheet operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { balanceSheetService } from '../services/balance-sheet.service';
import toast from 'react-hot-toast';

export const balanceSheetKeys = {
  all: ['balanceSheet'],
  detail: (filingId) => [...balanceSheetKeys.all, filingId],
};

/**
 * Hook for fetching balance sheet
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with balance sheet data
 */
export function useBalanceSheet(filingId) {
  return useQuery({
    queryKey: balanceSheetKeys.detail(filingId),
    queryFn: async () => {
      if (!filingId) return null;
      const result = await balanceSheetService.getBalanceSheet(filingId);
      return result.balanceSheet;
    },
    enabled: !!filingId,
  });
}

/**
 * Hook for updating balance sheet
 * @param {string} filingId - Filing ID
 * @returns {object} Mutation object
 */
export function useUpdateBalanceSheet(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (balanceSheetData) => {
      return await balanceSheetService.updateBalanceSheet(filingId, balanceSheetData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(balanceSheetKeys.detail(filingId));
      toast.success('Balance sheet updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update balance sheet');
    },
  });
}

