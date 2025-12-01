// =====================================================
// PRE-SUBMISSION VALIDATION HOOKS
// React Query hooks for pre-submission validation
// =====================================================

import { useMutation } from '@tanstack/react-query';
import { submissionService } from '../services/submission.service';
import toast from 'react-hot-toast';

/**
 * Hook for pre-submission validation
 */
export function usePreSubmissionValidation(filingId) {
  const runValidation = useMutation({
    mutationFn: (formData) => submissionService.runPreSubmissionValidation(filingId, formData),
    onError: (error) => {
      toast.error(error.message || 'Validation failed');
    },
  });

  return {
    runValidation: async (formData) => {
      const result = await runValidation.mutateAsync(formData);
      return result;
    },
    isPending: runValidation.isPending,
    validationResults: runValidation.data,
  };
}

