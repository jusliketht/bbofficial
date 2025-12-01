// =====================================================
// E-VERIFICATION HOOKS
// React Query hooks for E-verification methods
// =====================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionService } from '../services/submission.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for e-verification
 */
export const eVerificationKeys = {
  all: ['e-verification'],
  status: (filingId) => [...eVerificationKeys.all, 'status', filingId],
};

/**
 * Hook for E-verification operations
 */
export function useEVerification(filingId) {
  const queryClient = useQueryClient();

  // Send Aadhaar OTP
  const sendAadhaarOTP = useMutation({
    mutationFn: (aadhaarNumber) =>
      submissionService.sendAadhaarOTP(filingId, aadhaarNumber),
    onError: (error) => {
      toast.error(error.message || 'Failed to send Aadhaar OTP');
    },
  });

  // Verify Aadhaar OTP
  const verifyAadhaarOTP = useMutation({
    mutationFn: ({ aadhaarNumber, otp }) =>
      submissionService.verifyAadhaarOTP(filingId, aadhaarNumber, otp),
    onSuccess: () => {
      queryClient.invalidateQueries(eVerificationKeys.status(filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'Aadhaar OTP verification failed');
    },
  });

  // Verify Net Banking
  const verifyNetBanking = useMutation({
    mutationFn: (bankDetails) =>
      submissionService.verifyNetBanking(filingId, bankDetails),
    onSuccess: () => {
      queryClient.invalidateQueries(eVerificationKeys.status(filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'Net banking verification failed');
    },
  });

  // Verify Demat Account
  const verifyDemat = useMutation({
    mutationFn: (dematCredentials) =>
      submissionService.verifyDemat(filingId, dematCredentials),
    onSuccess: () => {
      queryClient.invalidateQueries(eVerificationKeys.status(filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'Demat verification failed');
    },
  });

  // Send Bank EVC
  const sendBankEVC = useMutation({
    mutationFn: (bankDetails) =>
      submissionService.sendBankEVC(filingId, bankDetails),
    onError: (error) => {
      toast.error(error.message || 'Failed to send Bank EVC');
    },
  });

  // Verify Bank EVC
  const verifyBankEVC = useMutation({
    mutationFn: ({ bankDetails, evc }) =>
      submissionService.verifyBankEVC(filingId, bankDetails, evc),
    onSuccess: () => {
      queryClient.invalidateQueries(eVerificationKeys.status(filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'Bank EVC verification failed');
    },
  });

  // Verify DSC
  const verifyDSC = useMutation({
    mutationFn: (dscFile) => submissionService.verifyDSC(filingId, dscFile),
    onSuccess: () => {
      queryClient.invalidateQueries(eVerificationKeys.status(filingId));
    },
    onError: (error) => {
      toast.error(error.message || 'DSC verification failed');
    },
  });

  // Get verification status
  const { data: verificationStatus } = useQuery({
    queryKey: eVerificationKeys.status(filingId),
    queryFn: () => submissionService.getVerificationStatus(filingId),
    enabled: !!filingId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    sendAadhaarOTP: async (aadhaarNumber) => {
      const result = await sendAadhaarOTP.mutateAsync(aadhaarNumber);
      return result;
    },
    verifyAadhaarOTP: async (aadhaarNumber, otp) => {
      const result = await verifyAadhaarOTP.mutateAsync({ aadhaarNumber, otp });
      return result;
    },
    verifyNetBanking: async (bankDetails) => {
      const result = await verifyNetBanking.mutateAsync(bankDetails);
      return result;
    },
    verifyDemat: async (dematCredentials) => {
      const result = await verifyDemat.mutateAsync(dematCredentials);
      return result;
    },
    sendBankEVC: async (bankDetails) => {
      const result = await sendBankEVC.mutateAsync(bankDetails);
      return result;
    },
    verifyBankEVC: async (bankDetails, evc) => {
      const result = await verifyBankEVC.mutateAsync({ bankDetails, evc });
      return result;
    },
    verifyDSC: async (dscFile) => {
      const result = await verifyDSC.mutateAsync(dscFile);
      return result;
    },
    verificationStatus,
    isProcessing:
      sendAadhaarOTP.isPending ||
      verifyAadhaarOTP.isPending ||
      verifyNetBanking.isPending ||
      verifyDemat.isPending ||
      sendBankEVC.isPending ||
      verifyBankEVC.isPending ||
      verifyDSC.isPending,
  };
}

