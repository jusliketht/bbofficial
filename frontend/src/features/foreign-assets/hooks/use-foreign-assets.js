// =====================================================
// FOREIGN ASSETS HOOKS
// React Query hooks for foreign assets operations
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import foreignAssetsService from '../services/foreign-assets.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for foreign assets
 */
export const foreignAssetsKeys = {
  all: ['foreign-assets'],
  filing: (filingId) => [...foreignAssetsKeys.all, 'filing', filingId],
};

/**
 * Hook to get foreign assets for a filing
 * @param {string} filingId - Filing ID
 * @returns {object} Query result with foreign assets
 */
export function useForeignAssets(filingId) {
  return useQuery({
    queryKey: foreignAssetsKeys.filing(filingId),
    queryFn: async () => {
      const result = await foreignAssetsService.getForeignAssets(filingId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch foreign assets');
      }
      return result;
    },
    enabled: !!filingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to add foreign asset
 * @returns {object} Mutation object
 */
export function useAddForeignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, assetData }) =>
      foreignAssetsService.addForeignAsset(filingId, assetData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(foreignAssetsKeys.filing(variables.filingId));
      toast.success('Foreign asset added successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add foreign asset');
    },
  });
}

/**
 * Hook to update foreign asset
 * @returns {object} Mutation object
 */
export function useUpdateForeignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, assetId, assetData }) =>
      foreignAssetsService.updateForeignAsset(filingId, assetId, assetData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(foreignAssetsKeys.filing(variables.filingId));
      toast.success('Foreign asset updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update foreign asset');
    },
  });
}

/**
 * Hook to delete foreign asset
 * @returns {object} Mutation object
 */
export function useDeleteForeignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, assetId }) =>
      foreignAssetsService.deleteForeignAsset(filingId, assetId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(foreignAssetsKeys.filing(variables.filingId));
      toast.success('Foreign asset deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete foreign asset');
    },
  });
}

/**
 * Hook to upload document for foreign asset
 * @returns {object} Mutation object
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filingId, assetId, documentUrl, documentType }) =>
      foreignAssetsService.uploadDocument(filingId, assetId, documentUrl, documentType),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(foreignAssetsKeys.filing(variables.filingId));
      toast.success('Document uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

