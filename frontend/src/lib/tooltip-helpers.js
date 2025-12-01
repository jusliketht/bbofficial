// =====================================================
// TOOLTIP HELPERS
// Utility functions for help text and definitions
// =====================================================

/**
 * Get help text for common form fields
 */
export const getFieldHelpText = (fieldName) => {
  const helpTexts = {
    // Income fields
    salary: 'Your total salary including basic pay, allowances, and bonuses before deductions.',
    hra: 'House Rent Allowance - A component of salary given to employees to meet rental expenses. Part of it may be exempt from tax based on actual rent paid, HRA received, and salary structure.',
    'house-property': 'Income from house property includes rental income from properties you own, after deducting municipal taxes, standard deduction, and interest on home loan.',
    'capital-gains': 'Profit from sale of assets like stocks, mutual funds, or property. Short-term gains (held < 1 year for stocks, < 2 years for property) and long-term gains are taxed differently.',
    'other-income': 'Any other income not covered in salary, house property, or capital gains, such as interest from savings accounts, fixed deposits, etc.',

    // Deduction fields
    'section80C': 'Allows deductions up to ₹1,50,000 for investments in PPF, ELSS mutual funds, NSC, life insurance premium, principal repayment of home loan, etc.',
    'section80D': 'Deduction for health insurance premium paid for self, spouse, children, and parents. Up to ₹25,000 for self/family, additional ₹25,000 for parents (₹50,000 if parents are senior citizens).',
    'section80G': 'Deduction for donations made to eligible charitable institutions. 50% or 100% of donation amount depending on the institution.',
    'section80TTA': 'Deduction up to ₹10,000 on interest earned from savings bank accounts.',
    'section80TTB': 'Deduction up to ₹50,000 on interest earned from savings bank accounts and fixed deposits (for senior citizens only).',

    // Tax fields
    tds: 'Tax Deducted at Source - Tax already deducted by your employer or other payers before you receive the income. This is shown in Form 16/16A.',
    'advance-tax': 'Tax paid in advance during the financial year, typically in installments if your tax liability exceeds ₹10,000.',
    'self-assessment-tax': 'Additional tax paid at the time of filing return if your total tax liability exceeds TDS and advance tax paid.',

    // Bank fields
    'account-number': 'Your bank account number where you want to receive tax refund (if applicable).',
    ifsc: 'IFSC (Indian Financial System Code) - 11-character code that identifies your bank branch. Usually found on your cheque or bank statement.',
    'account-type': 'Type of bank account - Savings or Current. Refunds are typically processed to savings accounts.',
  };

  return helpTexts[fieldName] || null;
};

/**
 * Get detailed help content for sections
 */
export const getSectionHelpContent = (sectionName) => {
  const sectionHelp = {
    'personal-info': {
      title: 'Personal Information',
      content: 'Enter your personal details including name, PAN, date of birth, and contact information. This information is used to identify you and process your ITR filing.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/personal-information',
      },
    },
    income: {
      title: 'Income Details',
      content: 'Declare all sources of income including salary, house property, capital gains, and other income. Ensure you include all income as per Form 16, AIS, and Form 26AS.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/income-declaration',
      },
    },
    deductions: {
      title: 'Deductions (Chapter VI-A)',
      content: 'Claim deductions under various sections like 80C, 80D, 80G, etc. These deductions reduce your taxable income and can significantly lower your tax liability. Ensure you have supporting documents for all deductions claimed.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/deductions',
      },
    },
    'taxes-paid': {
      title: 'Taxes Paid',
      content: 'Enter details of all taxes already paid including TDS (from Form 16/16A), advance tax, and self-assessment tax. This information is used to calculate your refund or tax payable.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/taxes-paid',
      },
    },
    'bank-details': {
      title: 'Bank Account Details',
      content: 'Provide your bank account details for receiving tax refund (if applicable). Ensure the account is active and the IFSC code is correct.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/bank-details',
      },
    },
    'tax-computation': {
      title: 'Tax Computation',
      content: 'Review your tax computation including gross income, deductions, taxable income, tax liability, and refund/payable amount. The system automatically calculates tax based on current year tax slabs.',
      downloadLink: {
        label: 'Download Guide',
        href: '/guides/tax-computation',
      },
    },
  };

  return sectionHelp[sectionName] || null;
};

/**
 * Get tax term definition
 */
export const getTaxTermDefinition = (term) => {
  const definitions = {
    'Taxable Income': {
      definition: 'The portion of your total income on which tax is calculated after all deductions and exemptions are applied.',
      formula: 'Gross Income - Deductions = Taxable Income',
    },
    'Gross Income': {
      definition: 'Your total income from all sources before any deductions or exemptions.',
    },
    Deductions: {
      definition: 'Amounts that can be subtracted from your gross income to reduce your taxable income, such as Section 80C investments.',
    },
    TDS: {
      definition: 'Tax Deducted at Source - Tax already deducted by your employer or other payers before you receive the income.',
    },
    'Advance Tax': {
      definition: 'Tax paid in advance during the financial year, typically in installments.',
    },
    Refund: {
      definition: 'Amount returned to you when the tax you paid (TDS + Advance Tax) exceeds your actual tax liability.',
    },
    HRA: {
      definition: 'House Rent Allowance - A component of salary given to employees to meet rental expenses. Part of it may be exempt from tax.',
    },
    'Section 80C': {
      definition: 'A tax deduction section that allows deductions up to ₹1,50,000 for investments in PPF, ELSS, NSC, life insurance, etc.',
    },
    'Section 80D': {
      definition: 'Deduction for health insurance premium paid. Up to ₹25,000 for self/family, additional ₹25,000 for parents.',
    },
    'Old Regime': {
      definition: 'The traditional tax regime with various deductions and exemptions available under sections like 80C, 80D, HRA, etc.',
    },
    'New Regime': {
      definition: 'The simplified tax regime (introduced in Budget 2020) with lower tax rates but limited deductions. Standard deduction of ₹50,000 is available.',
    },
  };

  return definitions[term] || null;
};

/**
 * Check if first-time tooltip should be shown
 */
export const shouldShowFirstTimeTooltip = (feature) => {
  if (!feature) return false;
  const hasSeen = localStorage.getItem(`firstTimeTour_${feature}`);
  return !hasSeen;
};

/**
 * Mark first-time tooltip as seen
 */
export const markFirstTimeTooltipAsSeen = (feature) => {
  if (feature) {
    localStorage.setItem(`firstTimeTour_${feature}`, 'true');
  }
};

