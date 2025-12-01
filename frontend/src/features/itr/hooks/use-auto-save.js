// =====================================================
// AUTO-SAVE HOOK
// Enhanced auto-save with field blur and section change
// =====================================================

import { useEffect, useRef, useCallback } from 'react';
import { useDraftManagement } from '../../../hooks/useDraftManagement';

/**
 * Enhanced auto-save hook with field blur and section change triggers
 */
export function useAutoSave(filingId, draftType = 'itr_filing') {
  const {
    draft,
    isDirty,
    isSaving,
    lastSaved,
    saveDraft,
    updateDraft,
  } = useDraftManagement(filingId, draftType);

  const fieldBlurTimeoutRef = useRef(null);
  const sectionChangeTimeoutRef = useRef(null);

  /**
   * Save on field blur
   */
  const handleFieldBlur = useCallback(
    (fieldName, value) => {
      if (fieldBlurTimeoutRef.current) {
        clearTimeout(fieldBlurTimeoutRef.current);
      }

      fieldBlurTimeoutRef.current = setTimeout(() => {
        updateDraft({ [fieldName]: value });
      }, 500); // Save 500ms after field blur
    },
    [updateDraft],
  );

  /**
   * Save on section change
   */
  const handleSectionChange = useCallback(
    (newSection, formData) => {
      if (sectionChangeTimeoutRef.current) {
        clearTimeout(sectionChangeTimeoutRef.current);
      }

      sectionChangeTimeoutRef.current = setTimeout(() => {
        if (isDirty) {
          saveDraft({ ...formData, currentSection: newSection });
        }
      }, 300); // Save 300ms after section change
    },
    [isDirty, saveDraft],
  );

  /**
   * Manual save
   */
  const manualSave = useCallback(
    (formData) => {
      saveDraft(formData);
    },
    [saveDraft],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fieldBlurTimeoutRef.current) {
        clearTimeout(fieldBlurTimeoutRef.current);
      }
      if (sectionChangeTimeoutRef.current) {
        clearTimeout(sectionChangeTimeoutRef.current);
      }
    };
  }, []);

  return {
    draft,
    isDirty,
    isSaving,
    lastSaved,
    handleFieldBlur,
    handleSectionChange,
    manualSave,
    updateDraft,
  };
}

export default useAutoSave;

