// =====================================================
// AI SUGGESTIONS HOOK
// React Query hook for AI-powered deduction suggestions
// =====================================================

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { deductionService } from '../services/deduction.service';
import taxSavingsService from '../../../services/taxSavingsService';

/**
 * Hook to fetch AI suggestions for deductions
 */
export function useAISuggestions(filingId, formData, debounceMs = 300) {
  return useQuery({
    queryKey: ['aiSuggestions', filingId, formData],
    queryFn: async () => {
      try {
        // Try to get suggestions from the deduction service
        const response = await deductionService.getAISuggestions(filingId);
        if (response.data && response.data.length > 0) {
          return response.data;
        }

        // Fallback: return mock suggestions
        return getMockSuggestions(formData);
      } catch (error) {
        // Return mock suggestions for development
        return getMockSuggestions(formData);
      }
    },
    enabled: !!filingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Generate mock suggestions based on form data
 */
function getMockSuggestions(formData) {
  const suggestions = [];
  const deductions = formData?.deductions || {};

  // Suggest 80C if not fully utilized
  if ((deductions.section80C || 0) < 150000) {
    suggestions.push({
      id: 'suggest-80c',
      section: '80C',
      title: 'Maximize Section 80C Deduction',
      description: 'You can claim up to ₹1,50,000 under Section 80C. Consider ELSS, PPF, or LIC investments.',
      priority: 'high',
      estimatedSavings: 30000,
      currentAmount: deductions.section80C || 0,
      suggestedAmount: 150000,
      actionable: true,
    });
  }

  // Suggest 80D if not claimed
  if (!deductions.section80D || deductions.section80D === 0) {
    suggestions.push({
      id: 'suggest-80d',
      section: '80D',
      title: 'Claim Health Insurance Premium',
      description: 'You can claim up to ₹25,000 for health insurance premiums under Section 80D.',
      priority: 'high',
      estimatedSavings: 5000,
      currentAmount: 0,
      suggestedAmount: 25000,
      actionable: true,
    });
  }

  // Suggest 80G if not claimed
  if (!deductions.section80G || deductions.section80G === 0) {
    suggestions.push({
      id: 'suggest-80g',
      section: '80G',
      title: 'Consider Charitable Donations',
      description: 'Donations to approved institutions are 100% deductible under Section 80G.',
      priority: 'medium',
      estimatedSavings: 10000,
      currentAmount: 0,
      suggestedAmount: 10000,
      actionable: true,
    });
  }

  return suggestions;
}

