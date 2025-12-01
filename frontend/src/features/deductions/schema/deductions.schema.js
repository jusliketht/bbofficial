// =====================================================
// DEDUCTION VALIDATION SCHEMAS
// Validation rules for all deduction sections
// =====================================================

import { VALIDATION_RULES } from '../constants/deduction-limits';

/**
 * Validate PAN format
 */
export const validatePAN = (pan) => {
  if (!pan) return { valid: true }; // Optional field
  const isValid = VALIDATION_RULES.pan.pattern.test(pan);
  return {
    valid: isValid,
    error: isValid ? null : VALIDATION_RULES.pan.message,
  };
};

/**
 * Validate amount
 */
export const validateAmount = (amount, min = 0, max = VALIDATION_RULES.amount.max) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < min) {
    return { valid: false, error: `Amount must be at least ₹${min.toLocaleString('en-IN')}` };
  }
  if (numAmount > max) {
    return { valid: false, error: `Amount cannot exceed ₹${max.toLocaleString('en-IN')}` };
  }
  return { valid: true, error: null };
};

/**
 * Section 80G validation schema
 */
export const validateSection80G = (data) => {
  const errors = {};

  if (!data.doneeName?.trim()) {
    errors.doneeName = 'Donee name is required';
  }
  if (!data.doneeAddress?.trim()) {
    errors.doneeAddress = 'Donee address is required';
  }
  if (!data.donationAmount) {
    errors.donationAmount = 'Donation amount is required';
  } else {
    const amountValidation = validateAmount(data.donationAmount);
    if (!amountValidation.valid) {
      errors.donationAmount = amountValidation.error;
    }
  }
  if (data.doneePan) {
    const panValidation = validatePAN(data.doneePan);
    if (!panValidation.valid) {
      errors.doneePan = panValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Section 80GG validation schema
 */
export const validateSection80GG = (data, totalIncome = 0) => {
  const errors = {};

  if (!data.rentPaid) {
    errors.rentPaid = 'Rent paid is required';
  } else {
    const amountValidation = validateAmount(data.rentPaid);
    if (!amountValidation.valid) {
      errors.rentPaid = amountValidation.error;
    }
  }
  if (!data.landlordName?.trim()) {
    errors.landlordName = 'Landlord name is required';
  }
  if (!data.propertyAddress?.trim()) {
    errors.propertyAddress = 'Property address is required';
  }

  const rentAmount = parseFloat(data.rentPaid) || 0;
  if (rentAmount > 100000 && !data.landlordPan) {
    errors.landlordPan = 'Landlord PAN is required for rent exceeding ₹1,00,000/year';
  }
  if (data.landlordPan) {
    const panValidation = validatePAN(data.landlordPan);
    if (!panValidation.valid) {
      errors.landlordPan = panValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Section 80GGA validation schema
 */
export const validateSection80GGA = (data) => {
  const errors = {};

  if (!data.institutionName?.trim()) {
    errors.institutionName = 'Institution name is required';
  }
  if (!data.institutionAddress?.trim()) {
    errors.institutionAddress = 'Institution address is required';
  }
  if (!data.registrationNumber?.trim()) {
    errors.registrationNumber = 'Registration number is required';
  }
  if (!data.donationAmount) {
    errors.donationAmount = 'Donation amount is required';
  } else {
    const amountValidation = validateAmount(data.donationAmount);
    if (!amountValidation.valid) {
      errors.donationAmount = amountValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Section 80GGC validation schema
 */
export const validateSection80GGC = (data) => {
  const errors = {};

  if (!data.partyName?.trim()) {
    errors.partyName = 'Political party name is required';
  }
  if (!data.partyRegistrationNumber?.trim()) {
    errors.partyRegistrationNumber = 'Party registration number is required';
  }
  if (!data.donationAmount) {
    errors.donationAmount = 'Donation amount is required';
  } else {
    const amountValidation = validateAmount(data.donationAmount);
    if (!amountValidation.valid) {
      errors.donationAmount = amountValidation.error;
    }
    // Check cash donation limit
    if (data.paymentMode === 'cash' && parseFloat(data.donationAmount) > 2000) {
      errors.donationAmount = 'Cash donations cannot exceed ₹2,000';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Section 80TTA/80TTB validation schema
 */
export const validateSection80TTA = (data, limit = 10000, currentTotal = 0) => {
  const errors = {};

  if (!data.bankName?.trim()) {
    errors.bankName = 'Bank name is required';
  }
  if (!data.accountNumber?.trim()) {
    errors.accountNumber = 'Account number is required';
  }
  if (!data.interestAmount) {
    errors.interestAmount = 'Interest amount is required';
  } else {
    const amountValidation = validateAmount(data.interestAmount);
    if (!amountValidation.valid) {
      errors.interestAmount = amountValidation.error;
    }
    // Check limit
    if (parseFloat(data.interestAmount) + currentTotal > limit) {
      errors.interestAmount = `Total interest cannot exceed ₹${limit.toLocaleString('en-IN')}`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Section 80U validation schema
 */
export const validateSection80U = (data) => {
  const errors = {};

  if (!data.disabilityPercentage) {
    errors.disabilityPercentage = 'Disability percentage is required';
  }
  if (!data.certificateNumber?.trim()) {
    errors.certificateNumber = 'Certificate number is required';
  }
  if (!data.certificateDate) {
    errors.certificateDate = 'Certificate date is required';
  }
  if (!data.certificateIssuingAuthority?.trim()) {
    errors.certificateIssuingAuthority = 'Issuing authority is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

