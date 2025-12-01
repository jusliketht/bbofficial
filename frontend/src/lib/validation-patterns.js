// =====================================================
// VALIDATION PATTERNS
// Reusable validation functions for common field types
// Per UI.md specifications (Section 4.4)
// =====================================================

/**
 * PAN Format Validation
 * Format: AAAAA0000A (5 letters, 4 numbers, 1 letter)
 */
export const validatePAN = (pan) => {
  if (!pan) return { isValid: false, error: 'PAN is required' };

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const normalizedPAN = pan.toUpperCase().replace(/\s/g, '');

  if (!panRegex.test(normalizedPAN)) {
    return {
      isValid: false,
      error: 'Invalid PAN format. Expected: AAAAA0000A (5 letters, 4 numbers, 1 letter)',
      formatHint: 'Format: AAAAA0000A (5 letters, 4 numbers, 1 letter)',
    };
  }

  return { isValid: true, normalized: normalizedPAN };
};

/**
 * IFSC Code Validation
 * Format: 11 characters (4 letters, 0, 6 alphanumeric)
 */
export const validateIFSC = (ifsc) => {
  if (!ifsc) return { isValid: false, error: 'IFSC code is required' };

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const normalizedIFSC = ifsc.toUpperCase().replace(/\s/g, '');

  if (!ifscRegex.test(normalizedIFSC)) {
    return {
      isValid: false,
      error: 'Invalid IFSC format. Expected: AAAA0XXXXXX',
      formatHint: 'Format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)',
    };
  }

  return { isValid: true, normalized: normalizedIFSC };
};

/**
 * Aadhaar Format Validation
 * Format: 12 digits
 */
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return { isValid: false, error: 'Aadhaar number is required' };

  const aadhaarRegex = /^\d{12}$/;
  const normalizedAadhaar = aadhaar.replace(/\s|-/g, '');

  if (!aadhaarRegex.test(normalizedAadhaar)) {
    return {
      isValid: false,
      error: 'Invalid Aadhaar format. Expected: 12 digits',
      formatHint: 'Format: 12 digits (XXXX XXXX XXXX)',
    };
  }

  // Aadhaar should not start with 0 or 1
  if (normalizedAadhaar.startsWith('0') || normalizedAadhaar.startsWith('1')) {
    return {
      isValid: false,
      error: 'Invalid Aadhaar number. Cannot start with 0 or 1',
    };
  }

  return { isValid: true, normalized: normalizedAadhaar };
};

/**
 * Date Range Validation
 * Validates that date is within acceptable range
 */
export const validateDateRange = (date, minDate, maxDate) => {
  if (!date) return { isValid: false, error: 'Date is required' };

  const dateObj = new Date(date);
  const min = minDate ? new Date(minDate) : null;
  const max = maxDate ? new Date(maxDate) : null;

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (min && dateObj < min) {
    return {
      isValid: false,
      error: `Date must be after ${min.toLocaleDateString('en-IN')}`,
    };
  }

  if (max && dateObj > max) {
    return {
      isValid: false,
      error: `Date must be before ${max.toLocaleDateString('en-IN')}`,
    };
  }

  return { isValid: true };
};

/**
 * Amount Validation with Limits
 */
export const validateAmount = (amount, min = 0, max = null) => {
  if (amount === null || amount === undefined || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Invalid amount format' };
  }

  if (numAmount < min) {
    return {
      isValid: false,
      error: `Amount must be at least ${min.toLocaleString('en-IN')}`,
    };
  }

  if (max !== null && numAmount > max) {
    return {
      isValid: false,
      error: `Amount cannot exceed ${max.toLocaleString('en-IN')}`,
      suggestion: max,
    };
  }

  return { isValid: true, normalized: numAmount };
};

/**
 * Real-time Format Checking
 * Returns format hint while user is typing
 */
export const getFormatHint = (fieldType, value) => {
  if (!value || value.length === 0) return null;

  const hints = {
    pan: 'Format: AAAAA0000A (5 letters, 4 numbers, 1 letter)',
    ifsc: 'Format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)',
    aadhaar: 'Format: 12 digits (XXXX XXXX XXXX)',
    email: 'Format: name@example.com',
    phone: 'Format: 10 digits (XXXXXXXXXX)',
  };

  return hints[fieldType] || null;
};

/**
 * Validate Required Field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName || 'This field'} is required` };
  }
  return { isValid: true };
};

/**
 * Validate Email Format
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email is required' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format. Expected: name@example.com',
      formatHint: 'Format: name@example.com',
    };
  }

  return { isValid: true };
};

/**
 * Validate Phone Number (Indian)
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, error: 'Phone number is required' };

  const phoneRegex = /^[6-9]\d{9}$/;
  const normalizedPhone = phone.replace(/\s|-/g, '');

  if (!phoneRegex.test(normalizedPhone)) {
    return {
      isValid: false,
      error: 'Invalid phone number. Expected: 10 digits starting with 6-9',
      formatHint: 'Format: 10 digits (XXXXXXXXXX)',
    };
  }

  return { isValid: true, normalized: normalizedPhone };
};

