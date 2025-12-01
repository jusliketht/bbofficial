// =====================================================
// BANK DETAILS HOOKS
// React Query hooks for bank details
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankDetailsService } from '../services/bank-details.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for bank details
 */
export const bankDetailsKeys = {
  all: ['bank-details'],
  detail: (filingId) => [...bankDetailsKeys.all, 'detail', filingId],
  verification: (filingId, accountId) => [...bankDetailsKeys.detail(filingId), 'verification', accountId],
};

/**
 * Hook to get bank details for a filing
 */
export function useBankDetails(filingId) {
  return useQuery({
    queryKey: bankDetailsKeys.detail(filingId),
    queryFn: () => bankDetailsService.getBankDetails(filingId),
    enabled: !!filingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update bank details
 */
export function useUpdateBankDetails(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bankDetails) => bankDetailsService.updateBankDetails(filingId, bankDetails),
    onSuccess: () => {
      queryClient.invalidateQueries(bankDetailsKeys.detail(filingId));
      toast.success('Bank details updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update bank details');
    },
  });
}

/**
 * Hook to verify bank account
 */
export function useVerifyBankAccount(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, accountNumber, ifsc }) =>
      bankDetailsService.verifyBankAccount(filingId, { accountId, accountNumber, ifsc }),
    onSuccess: () => {
      queryClient.invalidateQueries(bankDetailsKeys.detail(filingId));
      toast.success('Bank account verified successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Bank account verification failed');
    },
  });
}

/**
 * Hook to pre-validate bank account (IFSC lookup)
 */
export function usePreValidateBankAccount() {
  return useMutation({
    mutationFn: (ifsc) => bankDetailsService.preValidateBankAccount(ifsc),
  });
}

