// =====================================================
// COMPREHENSIVE TEST DATA - END-TO-END WORKFLOW TESTING
// Mock data for validating complete user journeys
// =====================================================

export const TestUsers = {
  // End User Test Accounts
  endUser: {
    google: {
      email: 'testuser@gmail.com',
      name: 'Test User',
      pan: 'ABCDE1234F',
      dob: '1990-01-15',
      aadhaar: '123456789012',
      phone: '+919876543210'
    },
    email: {
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      name: 'Test User Email',
      pan: 'FGHIJ5678K',
      dob: '1985-05-20',
      aadhaar: '987654321098',
      phone: '+919876543211'
    },
    freelancer: {
      email: 'freelancer@example.com',
      password: 'TestPassword123!',
      name: 'Freelance User',
      pan: 'LMNOP9012Q',
      dob: '1988-12-10',
      aadhaar: '112233445566',
      phone: '+919876543212'
    }
  },

  // CA Test Accounts
  ca: {
    newCA: {
      email: 'newca@example.com',
      password: 'TestPassword123!',
      name: 'New CA',
      pan: 'RSTUV3456W',
      dob: '1980-03-25',
      aadhaar: '556677889900',
      phone: '+919876543213'
    },
    existingCA: {
      email: 'existingca@example.com',
      password: 'TestPassword123!',
      name: 'Existing CA',
      pan: 'XYZAB7890C',
      dob: '1975-08-15',
      aadhaar: '998877665544',
      phone: '+919876543214'
    }
  }
};

export const TestForm16Data = {
  salaried: {
    employeeName: 'John Doe',
    pan: 'ABCDE1234F',
    employer: 'Test Company Pvt Ltd',
    financialYear: '2023-24',
    grossSalary: 800000,
    tdsDeducted: 80000,
    netSalary: 720000,
    epfContribution: 96000,
    professionalTax: 2400,
    hra: 240000,
    lta: 20000,
    medicalAllowance: 15000
  },
  highIncome: {
    employeeName: 'Jane Smith',
    pan: 'FGHIJ5678K',
    employer: 'Big Corp Ltd',
    financialYear: '2023-24',
    grossSalary: 1500000,
    tdsDeducted: 225000,
    netSalary: 1275000,
    epfContribution: 180000,
    professionalTax: 2500,
    hra: 450000,
    lta: 40000,
    medicalAllowance: 25000
  }
};

export const TestIncomeData = {
  business: {
    type: 'Business/Profession',
    grossReceipts: 500000,
    expenses: 150000,
    netIncome: 350000,
    description: 'Freelance consulting services'
  },
  otherSources: {
    type: 'Other Sources',
    interestFromSavings: 8500,
    interestFromFD: 25000,
    dividendIncome: 15000,
    totalOtherIncome: 48500
  },
  houseProperty: {
    type: 'House Property',
    annualRent: 240000,
    municipalTax: 12000,
    interestOnLoan: 180000,
    netIncome: 48000
  }
};

export const TestDeductionData = {
  section80C: {
    ppf: 50000,
    licPremium: 25000,
    elss: 30000,
    nsc: 20000,
    total: 125000
  },
  section80D: {
    healthInsuranceSelf: 15000,
    healthInsuranceParents: 25000,
    medicalExpenses: 10000,
    total: 50000
  },
  section80G: {
    donations: 20000,
    description: 'Donations to registered charities'
  },
  section80TTA: {
    interestFromSavings: 8500,
    maxDeduction: 10000
  }
};

export const TestBankData = {
  primary: {
    accountNumber: '1234567890123456',
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    branchName: 'Main Branch',
    accountType: 'Savings',
    isPrimary: true
  },
  secondary: {
    accountNumber: '9876543210987654',
    ifsc: 'HDFC0000987',
    bankName: 'HDFC Bank',
    branchName: 'Corporate Branch',
    accountType: 'Current',
    isPrimary: false
  }
};

export const TestCAFirmData = {
  newFirm: {
    firmName: 'Test CA Firm',
    registrationNumber: 'CA123456',
    address: {
      street: '123 Business Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    contact: {
      phone: '+912234567890',
      email: 'info@testcafirm.com',
      website: 'www.testcafirm.com'
    },
    services: ['ITR Filing', 'Tax Planning', 'Audit Services']
  }
};

export const TestClientData = {
  individual: {
    name: 'Client Individual',
    email: 'client@example.com',
    pan: 'CLIENT1234A',
    dob: '1992-06-15',
    phone: '+919876543215',
    address: {
      street: '456 Client Street',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  },
  business: {
    name: 'Client Business',
    email: 'business@example.com',
    pan: 'BUSINESS5678B',
    registrationNumber: 'REG123456',
    phone: '+919876543216',
    address: {
      street: '789 Business Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  }
};

export const TestValidationScenarios = {
  validPAN: ['ABCDE1234F', 'FGHIJ5678K', 'LMNOP9012Q'],
  invalidPAN: ['ABCDE1234', 'ABCDE1234G', '1234567890', 'ABCDE12345'],
  validAadhaar: ['123456789012', '987654321098', '112233445566'],
  invalidAadhaar: ['12345678901', '1234567890123', '12345678901a'],
  validIFSC: ['SBIN0001234', 'HDFC0000987', 'ICIC0001234'],
  invalidIFSC: ['SBIN000123', 'HDFC0000987A', 'ICIC00012345']
};

export const TestErrorScenarios = {
  networkError: {
    message: 'Network connection failed',
    code: 'NETWORK_ERROR',
    retryable: true
  },
  validationError: {
    message: 'PAN must be exactly 10 characters',
    code: 'VALIDATION_ERROR',
    field: 'pan'
  },
  authenticationError: {
    message: 'Invalid credentials',
    code: 'AUTH_ERROR',
    retryable: false
  },
  serverError: {
    message: 'Internal server error',
    code: 'SERVER_ERROR',
    retryable: true
  }
};

export const TestWorkflowStates = {
  newUser: {
    onboardingCompleted: false,
    filingInProgress: false,
    completedFilings: 0
  },
  inProgressFiling: {
    onboardingCompleted: true,
    filingInProgress: true,
    currentStep: 'income_details',
    draftData: {
      assessmentYear: '2023-24',
      pan: 'ABCDE1234F',
      dob: '1990-01-15',
      personalInfo: {
        name: 'Test User',
        address: 'Test Address'
      },
      incomeDetails: {
        salary: 800000,
        tds: 80000
      }
    }
  },
  completedFiling: {
    onboardingCompleted: true,
    filingInProgress: false,
    completedFilings: 1,
    lastFiling: {
      assessmentYear: '2023-24',
      status: 'submitted',
      submissionDate: '2024-01-15',
      refundAmount: 25000
    }
  }
};

export const TestPerformanceData = {
  largeDataset: {
    incomeSources: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      type: `Income Source ${i + 1}`,
      amount: Math.floor(Math.random() * 100000) + 10000
    })),
    deductions: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      section: `80${String.fromCharCode(65 + i)}`,
      amount: Math.floor(Math.random() * 50000) + 5000
    }))
  },
  slowNetwork: {
    latency: 2000,
    timeout: 10000,
    retryAttempts: 3
  }
};

export default {
  TestUsers,
  TestForm16Data,
  TestIncomeData,
  TestDeductionData,
  TestBankData,
  TestCAFirmData,
  TestClientData,
  TestValidationScenarios,
  TestErrorScenarios,
  TestWorkflowStates,
  TestPerformanceData
};
