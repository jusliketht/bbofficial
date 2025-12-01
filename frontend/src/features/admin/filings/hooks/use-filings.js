// =====================================================
// ADMIN FILINGS HOOKS
// React Query hooks for admin filing management
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFilingsService } from '../services/filings.service';
import toast from 'react-hot-toast';

export const useAdminFilings = (params = {}) => {
  return useQuery({
    queryKey: ['adminFilings', params],
    queryFn: () => adminFilingsService.getFilings(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useAdminFilingDetails = (filingId, enabled = true) => {
  return useQuery({
    queryKey: ['adminFilingDetails', filingId],
    queryFn: () => adminFilingsService.getFilingDetails(filingId),
    enabled: enabled && !!filingId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminFilingAuditLog = (filingId) => {
  return useQuery({
    queryKey: ['adminFilingAuditLog', filingId],
    queryFn: () => adminFilingsService.getFilingAuditLog(filingId),
    enabled: !!filingId,
  });
};

export const useAdminFilingDocuments = (filingId) => {
  return useQuery({
    queryKey: ['adminFilingDocuments', filingId],
    queryFn: () => adminFilingsService.getFilingDocuments(filingId),
    enabled: !!filingId,
  });
};

export const useAdminFilingIssues = (params = {}) => {
  return useQuery({
    queryKey: ['adminFilingIssues', params],
    queryFn: () => adminFilingsService.getFilingIssues(params),
  });
};

export const useAdminFilingStats = () => {
  return useQuery({
    queryKey: ['adminFilingStats'],
    queryFn: () => adminFilingsService.getFilingStats(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminFilingAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['adminFilingAnalytics', params],
    queryFn: () => adminFilingsService.getFilingAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, data }) => adminFilingsService.updateFiling(filingId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilings']);
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Filing updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update filing');
    },
  });
};

export const useReprocessAdminFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, reason }) => adminFilingsService.reprocessFiling(filingId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilings']);
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Filing queued for reprocessing');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reprocess filing');
    },
  });
};

export const useCancelAdminFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, reason }) => adminFilingsService.cancelFiling(filingId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilings']);
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Filing cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel filing');
    },
  });
};

export const useOverrideAdminFilingValidation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, reason }) => adminFilingsService.overrideValidation(filingId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Validation overridden successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to override validation');
    },
  });
};

export const useFlagAdminFilingForReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, reason }) => adminFilingsService.flagForReview(filingId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Filing flagged for review');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to flag filing');
    },
  });
};

export const useAddAdminFilingNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filingId, notes, reason }) => adminFilingsService.addAdminNotes(filingId, notes, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminFilingDetails', variables.filingId]);
      toast.success('Notes added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add notes');
    },
  });
};

export const useExportAdminFilings = () => {
  return useMutation({
    mutationFn: ({ format, params }) => adminFilingsService.exportFilings(format, params),
    onSuccess: (data, variables) => {
      if (variables.format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `filings_export_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Filings exported successfully');
      } else {
        toast.success('Filings exported successfully');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export filings');
    },
  });
};

