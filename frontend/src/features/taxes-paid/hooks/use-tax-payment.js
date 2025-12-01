// =====================================================
// TAX PAYMENT HOOKS
// React Query hooks for tax payment operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxPaymentService from '../services/tax-payment.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for tax payments
 */
export const taxPaymentKeys = {
  all: ['tax-payment'],
  payment: (paymentId) => [...taxPaymentKeys.all, 'payment', paymentId],
  history: (filingId) => [...taxPaymentKeys.all, 'history', filingId],
};

/**
 * Hook to get tax payment status
 * @param {string} paymentId - Payment ID
 * @returns {object} Query result with payment status
 */
export function useTaxPayment(paymentId) {
  return useQuery({
    queryKey: taxPaymentKeys.payment(paymentId),
    queryFn: async () => {
      const result = await taxPaymentService.getPaymentStatus(paymentId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment status');
      }
      return result.payment;
    },
    enabled: !!paymentId,
    refetchInterval: (data) => {
      // Refetch every 5 seconds if payment is pending/processing
      if (data?.paymentStatus === 'pending' || data?.paymentStatus === 'processing') {
        return 5000;
      }
      return false;
    },
  });
}

/**
 * Hook to get payment history for a filing
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with payment history
 */
export function usePaymentHistory(filingId) {
  return useQuery({
    queryKey: taxPaymentKeys.history(filingId),
    queryFn: async () => {
      const result = await taxPaymentService.getPaymentHistory(filingId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment history');
      }
      return result;
    },
    enabled: !!filingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create payment order (Razorpay)
 * @returns {object} Mutation object
 */
export function useCreatePaymentOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, paymentId, paymentData }) =>
      taxPaymentService.createPaymentOrder(filingId, paymentId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxPaymentKeys.payment(variables.paymentId));
      queryClient.invalidateQueries(taxPaymentKeys.history(variables.filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create payment order');
    },
  });
}

/**
 * Hook to verify payment
 * @returns {object} Mutation object
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, verificationData }) =>
      taxPaymentService.verifyPayment(paymentId, verificationData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxPaymentKeys.payment(variables.paymentId));
      queryClient.invalidateQueries(taxPaymentKeys.history());
      toast.success('Payment verified successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Payment verification failed');
    },
  });
}

/**
 * Hook to initiate ITD payment
 * @returns {object} Mutation object
 */
export function useInitiateITDPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, paymentId }) =>
      taxPaymentService.initiateITDPayment(filingId, paymentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxPaymentKeys.payment(variables.paymentId));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to initiate ITD payment');
    },
  });
}

/**
 * Hook to upload payment proof
 * @returns {object} Mutation object
 */
export function useUploadPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, fileUrl }) =>
      taxPaymentService.uploadPaymentProof(paymentId, fileUrl),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxPaymentKeys.payment(variables.paymentId));
      queryClient.invalidateQueries(taxPaymentKeys.history());
      toast.success('Payment proof uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload payment proof');
    },
  });
}

/**
 * Hook to verify payment via Form 26AS
 * @returns {object} Mutation object
 */
export function useVerifyVia26AS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId) =>
      taxPaymentService.verifyVia26AS(paymentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(taxPaymentKeys.payment(variables));
      queryClient.invalidateQueries(taxPaymentKeys.history());
      toast.success('Payment verified via Form 26AS!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify payment via Form 26AS');
    },
  });
}

