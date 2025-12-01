// =====================================================
// USE INVESTMENT PLANNING HOOK
// React Query hooks for investment planning
// =====================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { investmentPlanningService } from '../services/investment-planning.service';
import toast from 'react-hot-toast';

export const investmentPlanningKeys = {
  all: ['investmentPlanning'],
  recommendations: (options) => [...investmentPlanningKeys.all, 'recommendations', options],
};

/**
 * Hook for fetching investment recommendations
 */
export function useInvestmentRecommendations(options = {}) {
  return useQuery({
    queryKey: investmentPlanningKeys.recommendations(options),
    queryFn: () => investmentPlanningService.getRecommendations(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for calculating NPS benefits
 */
export function useNPSCalculator() {
  return useMutation({
    mutationFn: ({ contribution, years, expectedReturns }) =>
      investmentPlanningService.calculateNPSBenefits(contribution, years, expectedReturns),
    onError: (error) => {
      toast.error(error.message || 'Failed to calculate NPS benefits');
    },
  });
}

