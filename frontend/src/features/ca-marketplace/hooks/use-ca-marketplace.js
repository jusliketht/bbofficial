// =====================================================
// CA MARKETPLACE HOOKS
// React Query hooks for CA marketplace
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caMarketplaceService } from '../services/marketplace.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for CA marketplace
 */
export const caMarketplaceKeys = {
  all: ['caMarketplace'],
  firms: (filters, pagination) => [...caMarketplaceKeys.all, 'firms', filters, pagination],
  firm: (firmId) => [...caMarketplaceKeys.all, 'firm', firmId],
  reviews: (firmId, pagination) => [...caMarketplaceKeys.all, 'reviews', firmId, pagination],
  slots: (firmId, date) => [...caMarketplaceKeys.all, 'slots', firmId, date],
};

/**
 * Hook to fetch CA firms for marketplace
 */
export function useCAFirms(filters = {}, pagination = {}) {
  return useQuery({
    queryKey: caMarketplaceKeys.firms(filters, pagination),
    queryFn: () => caMarketplaceService.getCAFirms(filters, pagination),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Hook to fetch CA firm details
 */
export function useCAFirmDetails(firmId, enabled = true) {
  return useQuery({
    queryKey: caMarketplaceKeys.firm(firmId),
    queryFn: () => caMarketplaceService.getCAFirmDetails(firmId),
    enabled: !!firmId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch CA firm reviews
 */
export function useCAFirmReviews(firmId, pagination = {}, enabled = true) {
  return useQuery({
    queryKey: caMarketplaceKeys.reviews(firmId, pagination),
    queryFn: () => caMarketplaceService.getCAFirmReviews(firmId, pagination),
    enabled: !!firmId && enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch available time slots
 */
export function useAvailableSlots(firmId, date, enabled = true) {
  return useQuery({
    queryKey: caMarketplaceKeys.slots(firmId, date),
    queryFn: () => caMarketplaceService.getAvailableSlots(firmId, date),
    enabled: !!firmId && !!date && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (slots change frequently)
  });
}

/**
 * Hook to send inquiry to CA firm
 */
export function useSendInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ firmId, inquiryData }) =>
      caMarketplaceService.sendInquiry(firmId, inquiryData),
    onSuccess: (data, variables) => {
      toast.success('Inquiry sent successfully!');
      // Invalidate firm details to refresh inquiry status
      queryClient.invalidateQueries(caMarketplaceKeys.firm(variables.firmId));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send inquiry');
    },
  });
}

/**
 * Hook to book consultation with CA firm
 */
export function useBookConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ firmId, bookingData }) =>
      caMarketplaceService.bookConsultation(firmId, bookingData),
    onSuccess: (data, variables) => {
      toast.success('Consultation booked successfully!');
      // Invalidate slots to refresh availability
      queryClient.invalidateQueries(caMarketplaceKeys.slots(variables.firmId, variables.bookingData.date));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to book consultation');
    },
  });
}

