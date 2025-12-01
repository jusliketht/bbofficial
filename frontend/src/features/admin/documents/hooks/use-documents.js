// =====================================================
// ADMIN DOCUMENTS HOOKS
// React Query hooks for admin document management
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminDocumentsService } from '../services/documents.service';
import toast from 'react-hot-toast';

export const useAdminDocuments = (params = {}) => {
  return useQuery({
    queryKey: ['adminDocuments', params],
    queryFn: () => adminDocumentsService.getDocuments(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useAdminDocumentDetails = (documentId, enabled = true) => {
  return useQuery({
    queryKey: ['adminDocumentDetails', documentId],
    queryFn: () => adminDocumentsService.getDocumentDetails(documentId),
    enabled: enabled && !!documentId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminDocumentExtractedData = (documentId) => {
  return useQuery({
    queryKey: ['adminDocumentExtractedData', documentId],
    queryFn: () => adminDocumentsService.getExtractedData(documentId),
    enabled: !!documentId,
  });
};

export const useAdminDocumentTemplates = () => {
  return useQuery({
    queryKey: ['adminDocumentTemplates'],
    queryFn: () => adminDocumentsService.getDocumentTemplates(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useAdminStorageStats = () => {
  return useQuery({
    queryKey: ['adminStorageStats'],
    queryFn: () => adminDocumentsService.getStorageStats(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteAdminDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, reason }) => adminDocumentsService.deleteDocument(documentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDocuments']);
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    },
  });
};

export const useReprocessAdminDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, reason }) => adminDocumentsService.reprocessDocument(documentId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminDocuments']);
      queryClient.invalidateQueries(['adminDocumentDetails', variables.documentId]);
      toast.success('Document queued for reprocessing');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reprocess document');
    },
  });
};

export const useUpdateAdminDocumentExtractedData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, data }) => adminDocumentsService.updateExtractedData(documentId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminDocumentExtractedData', variables.documentId]);
      queryClient.invalidateQueries(['adminDocumentDetails', variables.documentId]);
      toast.success('Extracted data updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update extracted data');
    },
  });
};

export const useCreateAdminDocumentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminDocumentsService.createDocumentTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDocumentTemplates']);
      toast.success('Document template created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create template');
    },
  });
};

export const useUpdateAdminDocumentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, data }) => adminDocumentsService.updateDocumentTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDocumentTemplates']);
      toast.success('Document template updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update template');
    },
  });
};

