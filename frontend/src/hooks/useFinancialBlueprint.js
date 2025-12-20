// =====================================================
// USE FINANCIAL BLUEPRINT HOOK
// Lightweight hook to fetch financial blueprint data
// =====================================================

import { useState, useEffect } from 'react';
import itrService from '../services/api/itrService';

/**
 * Hook to get financial blueprint for a filing
 * @param {string|null} filingId - Filing ID
 * @returns {object} { blueprint, isLoading, error }
 */
export function useFinancialBlueprint(filingId) {
  const [blueprint, setBlueprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filingId) {
      setBlueprint(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchBlueprint() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await itrService.getFinancialBlueprint(filingId);
        if (!cancelled) {
          setBlueprint(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load financial blueprint');
          console.error('Error fetching financial blueprint:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchBlueprint();

    return () => {
      cancelled = true;
    };
  }, [filingId]);

  return { blueprint, isLoading, error };
}

