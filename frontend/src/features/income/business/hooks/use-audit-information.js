// =====================================================
// USE AUDIT INFORMATION HOOK
// React Query hook for audit information operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditInformationService } from '../services/audit-information.service';
import toast from 'react-hot-toast';

export const auditInformationKeys = {
  all: ['auditInformation'],
  detail: (filingId) => [...auditInformationKeys.all, filingId],
};

/**
 * Hook for fetching audit information
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with audit information data
 */
export function useAuditInformation(filingId) {
  return useQuery({
    queryKey: auditInformationKeys.detail(filingId),
    queryFn: async () => {
      if (!filingId) return null;
      const result = await auditInformationService.getAuditInformation(filingId);
      return result.auditInfo;
    },
    enabled: !!filingId,
  });
}

/**
 * Hook for updating audit information
 * @param {string} filingId - Filing ID
 * @returns {object} Mutation object
 */
export function useUpdateAuditInformation(filingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditData) => {
      return await auditInformationService.updateAuditInformation(filingId, auditData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(auditInformationKeys.detail(filingId));
      toast.success('Audit information updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update audit information');
    },
  });
}

/**
 * Hook for checking audit applicability
 * @param {string} filingId - Filing ID
 * @returns {object} Mutation object
 */
export function useCheckAuditApplicability(filingId) {
  return useMutation({
    mutationFn: async () => {
      return await auditInformationService.checkAuditApplicability(filingId);
    },
  });
}

