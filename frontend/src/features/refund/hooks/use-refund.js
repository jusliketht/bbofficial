// =====================================================
// REFUND HOOKS
// React Query hooks for refund tracking
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundService } from '../services/refund.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for refund
 */
export const refundKeys = {
  all: ['refund'],
  status: (filingId) => [...refundKeys.all, 'status', filingId],
  history: (userId) => [...refundKeys.all, 'history', userId],
  timeline: (filingId) => [...refundKeys.status(filingId), 'timeline'],
};

/**
 * Hook to get refund status for a filing
 */
export function useRefund(filingId) {
  return useQuery({
    queryKey: refundKeys.status(filingId),
    queryFn: () => refundService.getRefundStatus(filingId),
    enabled: !!filingId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for active refunds
  });
}

/**
 * Hook to get refund history for a user
 */
export function useRefundHistory(userId, assessmentYear = null) {
  return useQuery({
    queryKey: [...refundKeys.history(userId), assessmentYear],
    queryFn: () => refundService.getRefundHistory(userId, assessmentYear),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update refund bank account
 */
export function useUpdateRefundAccount(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bankAccount) => refundService.updateRefundAccount(filingId, bankAccount),
    onSuccess: () => {
      queryClient.invalidateQueries(refundKeys.status(filingId));
      toast.success('Bank account updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update bank account');
    },
  });
}

/**
 * Hook to request refund re-issue
 */
export function useRequestRefundReissue(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason) => refundService.requestRefundReissue(filingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(refundKeys.status(filingId));
      toast.success('Refund re-issue request submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit re-issue request');
    },
  });
}

