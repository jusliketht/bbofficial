// =====================================================
// USE REAL-TIME VALIDATION HOOK
// React hook for real-time field validation with debouncing
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import ITRValidationEngine from '../components/ITR/core/ITRValidationEngine';

const validationEngine = new ITRValidationEngine();

/**
 * Hook for real-time validation with debouncing
 * @param {object} formData - Complete form data
 * @param {string} itrType - ITR type
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns {object} Validation state and methods
 */
const useRealTimeValidation = (formData = {}, itrType = 'ITR-1', debounceMs = 300) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimerRef = useRef(null);

  /**
   * Validate a single field
   * @param {string} fieldPath - Field path (e.g., 'personal_info.pan')
   * @param {any} value - Field value
   */
  const validateField = useCallback((fieldPath, value) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValidating(true);

    // Debounce validation
    debounceTimerRef.current = setTimeout(() => {
      try {
        const result = validationEngine.validateFieldRealTime(fieldPath, value, formData);

        setFieldErrors(prev => ({
          ...prev,
          [fieldPath]: result.isValid ? null : result.errors,
        }));
      } catch (error) {
        console.error('Validation error:', error);
        setFieldErrors(prev => ({
          ...prev,
          [fieldPath]: ['Validation error occurred'],
        }));
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  }, [formData, debounceMs]);

  /**
   * Validate all fields in a section
   * @param {string} sectionId - Section ID
   */
  const validateSection = useCallback((sectionId) => {
    setIsValidating(true);

    try {
      const sectionData = formData[sectionId] || {};
      const result = validationEngine.validateSection(sectionId, sectionData, formData);

      const errors = {};
      Object.keys(result.errors || {}).forEach(fieldId => {
        const fieldPath = `${sectionId}.${fieldId}`;
        errors[fieldPath] = result.errors[fieldId].errors || [];
      });

      setFieldErrors(prev => ({
        ...prev,
        ...errors,
      }));
    } catch (error) {
      console.error('Section validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  /**
   * Get errors for a specific field
   * @param {string} fieldPath - Field path
   * @returns {Array|null} Array of error messages or null if valid
   */
  const getFieldErrors = useCallback((fieldPath) => {
    return fieldErrors[fieldPath] || null;
  }, [fieldErrors]);

  /**
   * Check if a field is valid
   * @param {string} fieldPath - Field path
   * @returns {boolean} True if field is valid
   */
  const isFieldValid = useCallback((fieldPath) => {
    return !fieldErrors[fieldPath] || fieldErrors[fieldPath].length === 0;
  }, [fieldErrors]);

  /**
   * Clear errors for a field
   * @param {string} fieldPath - Field path
   */
  const clearFieldErrors = useCallback((fieldPath) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldPath];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Get all validation errors
   * @returns {object} Object with field paths as keys and error arrays as values
   */
  const getAllErrors = useCallback(() => {
    return { ...fieldErrors };
  }, [fieldErrors]);

  /**
   * Check if form has any errors
   * @returns {boolean} True if form has errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(fieldErrors).some(path => fieldErrors[path] && fieldErrors[path].length > 0);
  }, [fieldErrors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    validateField,
    validateSection,
    getFieldErrors,
    isFieldValid,
    clearFieldErrors,
    clearAllErrors,
    getAllErrors,
    hasErrors,
    isValidating,
    fieldErrors,
  };
};

export default useRealTimeValidation;

