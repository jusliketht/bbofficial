// =====================================================
// DEDUCTION LIMITS - FY 2024-25
// All Chapter VI-A deduction limits and rules
// =====================================================

export const DEDUCTION_LIMITS = {
  section80C: {
    limit: 150000,
    description: 'Investments & Savings (EPF, PPF, LIC, ELSS, etc.)',
  },
  section80CCC: {
    limit: 150000, // Shares limit with 80C
    description: 'Pension Fund Contributions',
  },
  section80CCD: {
    employee: 150000, // Shares limit with 80C
    employer: 0, // No limit, separate from 80C
    additional: 50000, // 80CCD(1B) - Additional NPS contribution
    description: 'NPS Contributions',
  },
  section80D: {
    selfFamily: 25000,
    parents: 25000,
    seniorCitizenSelf: 50000,
    seniorCitizenParents: 50000,
    preventiveHealth: 5000, // Included in above limits
    description: 'Health Insurance Premiums',
  },
  section80DD: {
    moderate: 75000, // 40-80% disability
    severe: 125000, // 80-100% disability
    description: 'Disabled Dependent',
  },
  section80DDB: {
    selfDependent: 40000,
    seniorCitizen: 100000,
    description: 'Medical Treatment',
  },
  section80E: {
    limit: Infinity, // No upper limit
    duration: 8, // 8 years from start of repayment
    description: 'Education Loan Interest',
  },
  section80EE: {
    limit: 50000,
    conditions: {
      loanAmount: 3500000, // ₹35 lakhs
      propertyValue: 5000000, // ₹50 lakhs
      firstHome: true,
    },
    description: 'Home Loan Interest (First-Time Buyer)',
  },
  section80G: {
    limit: Infinity, // No upper limit, but subject to qualifying conditions
    types: {
      '100%': ['PM Relief Fund', 'National Defence Fund', 'Prime Minister\'s National Relief Fund'],
      '50%': ['Other approved institutions'],
    },
    description: 'Donations',
  },
  section80GG: {
    limit: {
      formula: 'Lower of (Rent paid - 10% of total income) or ₹60,000 or 25% of total income',
      max: 60000,
    },
    conditions: {
      noHRA: true,
      selfOccupied: true,
      rentOver1LakhRequiresPan: true,
    },
    description: 'Rent Paid (No HRA)',
  },
  section80GGA: {
    limit: Infinity, // No upper limit
    description: 'Scientific Research Donations',
  },
  section80GGC: {
    limit: Infinity, // No upper limit
    conditions: {
      registeredParty: true,
      cashLimit: 2000, // Cash donations > ₹2,000 not allowed
    },
    description: 'Political Party Donations',
  },
  section80TTA: {
    limit: 10000,
    description: 'Savings Account Interest (Non-Senior Citizens)',
  },
  section80TTB: {
    limit: 50000,
    ageThreshold: 60,
    description: 'Savings Account Interest (Senior Citizens)',
  },
  section80U: {
    moderate: 75000, // 40-80% disability
    severe: 125000, // 80-100% disability
    description: 'Person with Disability',
  },
};

export const AGE_THRESHOLDS = {
  seniorCitizen: 60,
  superSeniorCitizen: 80,
};

export const INCOME_THRESHOLDS = {
  section80GG: {
    rentRequiresPan: 100000, // Rent > ₹1L/year requires landlord PAN
  },
};

export const VALIDATION_RULES = {
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    message: 'Invalid PAN format',
  },
  amount: {
    min: 0,
    max: 999999999,
  },
  file: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  },
};

