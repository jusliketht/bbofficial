// =====================================================
// SUBMISSION HOOKS
// React Query hooks for ITR submission
// =====================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionService } from '../services/submission.service';
import toast from 'react-hot-toast';

/**
 * Hook for submitting ITR filing
 */
export function useSubmitITR(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ verificationToken }) =>
      submissionService.submitITR(filingId, verificationToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['itr', 'filings', filingId]);
      queryClient.invalidateQueries(['itr', 'filings']);
      toast.success('ITR submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'ITR submission failed');
    },
  });
}

