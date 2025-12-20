// =====================================================
// USE FILING CONTEXT HOOK
// Centralized hook for filing state and allowed actions
// UI must never infer legality locally - use this hook
// =====================================================

import { useState, useEffect } from 'react';
import itrService from '../services/api/itrService';

/**
 * Hook to get filing context (lifecycle state, allowed actions, ITR type)
 *
 * @param {string|null} filingId - Filing ID
 * @returns {object} FilingUIContext with lifecycleState, itrType, allowedActions, isLoading, error
 *
 * @example
 * const { lifecycleState, allowedActions, itrType, isLoading } = useFilingContext(filingId);
 * const canEdit = allowedActions.includes('edit_data');
 */
export function useFilingContext(filingId) {
  const [context, setContext] = useState({
    lifecycleState: null,
    itrType: null,
    allowedActions: [],
    filingId: filingId || null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!filingId) {
      setContext(prev => ({
        ...prev,
        isLoading: false,
        lifecycleState: null,
        itrType: null,
        allowedActions: [],
      }));
      return;
    }

    let cancelled = false;

    async function fetchContext() {
      try {
        // Fetch allowed actions (returns { allowedActions, state, itrType? })
        const result = await itrService.getAllowedActions(filingId);
        // Handle both direct response and wrapped response (result.data || result)
        const data = result.data || result;
        const lifecycleState = data.state || null;
        const allowedActions = data.allowedActions || [];
        let itrType = data.itrType || null;
      // If itrType not in response, fetch it separately (backward compatibility)
                if (!itrType) {
          try {
            const filing = await itrService.getITR(filingId);
            itrType = filing?.filing?.itrType || filing?.itrType || null;
          } catch (filingError) {
            // Non-critical - itrType can be null
            console.warn('Could not fetch ITR type:', filingError);
          }
        }
        if (!cancelled) {
          setContext({
            lifecycleState,
            itrType,
            allowedActions,
            filingId,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setContext(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to load filing context',
            lifecycleState: null,
            itrType: null,
            allowedActions: [],
          }));
        }
      }
    }

    fetchContext();

    return () => {
      cancelled = true;
    };
  }, [filingId]);

  return context;
}

