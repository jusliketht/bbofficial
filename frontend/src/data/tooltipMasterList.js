/**
 * Tooltip Content Master List
 * 
 * Per Product Owner requirements:
 * - All common financial terms
 * - Plain-English explanations
 * - Concise (max 2 lines)
 * - Link/CTA to AI Assistant for deeper explanations
 * - Standard enterprise palette (Green, Orange, Red, Blue)
 */

export const TOOLTIP_MASTER_LIST = {
  // =====================================================
  // INCOME & EARNINGS TERMS
  // =====================================================
  'total_income': {
    title: 'Total Income',
    content: 'All money earned from salary, business, investments, and other sources before deductions.',
    category: 'income',
    priority: 'high',
    aiPrompt: 'Explain total income calculation and what sources are included'
  },
  'taxable_income': {
    title: 'Taxable Income',
    content: 'Income after deductions and exemptions that is subject to tax calculation.',
    category: 'income',
    priority: 'high',
    aiPrompt: 'How is taxable income calculated and what deductions apply?'
  },
  'gross_salary': {
    title: 'Gross Salary',
    content: 'Total salary before any deductions like tax, provident fund, or insurance.',
    category: 'income',
    priority: 'high',
    aiPrompt: 'What is included in gross salary and how is it different from net salary?'
  },
  'net_salary': {
    title: 'Net Salary',
    content: 'Take-home salary after all deductions including TDS, PF, and other contributions.',
    category: 'income',
    priority: 'high',
    aiPrompt: 'How is net salary calculated and what deductions are included?'
  },
  'tds': {
    title: 'TDS (Tax Deducted at Source)',
    content: 'Tax already deducted by employer or payer before you receive the income.',
    category: 'tax',
    priority: 'high',
    aiPrompt: 'Explain TDS rates, certificates, and how to claim refunds'
  },
  'tds_certificate': {
    title: 'TDS Certificate (Form 16/16A)',
    content: 'Official document showing tax deducted by employer or other payers.',
    category: 'tax',
    priority: 'high',
    aiPrompt: 'How to download TDS certificates and what information they contain'
  },

  // =====================================================
  // DEDUCTIONS & EXEMPTIONS
  // =====================================================
  'standard_deduction': {
    title: 'Standard Deduction',
    content: 'Fixed deduction of ₹50,000 available to all salaried employees without proof.',
    category: 'deduction',
    priority: 'high',
    aiPrompt: 'Standard deduction benefits and how it compares to itemized deductions'
  },
  'hra': {
    title: 'HRA (House Rent Allowance)',
    content: 'Tax exemption on house rent allowance based on actual rent paid and salary.',
    category: 'deduction',
    priority: 'high',
    aiPrompt: 'HRA calculation methods and required documents for claiming exemption'
  },
  'lta': {
    title: 'LTA (Leave Travel Allowance)',
    content: 'Tax exemption on travel allowance for domestic trips with family.',
    category: 'deduction',
    priority: 'medium',
    aiPrompt: 'LTA rules, limits, and how to claim exemption for family travel'
  },
  'medical_allowance': {
    title: 'Medical Allowance',
    content: 'Tax exemption on medical expenses up to ₹15,000 per year.',
    category: 'deduction',
    priority: 'medium',
    aiPrompt: 'Medical allowance limits and what expenses qualify for exemption'
  },
  'section_80c': {
    title: 'Section 80C Deductions',
    content: 'Tax deduction up to ₹1.5 lakhs for investments in PPF, ELSS, insurance, etc.',
    category: 'deduction',
    priority: 'high',
    aiPrompt: 'Complete list of Section 80C investments and their benefits'
  },
  'section_80d': {
    title: 'Section 80D (Health Insurance)',
    content: 'Tax deduction for health insurance premiums paid for self and family.',
    category: 'deduction',
    priority: 'high',
    aiPrompt: 'Health insurance deduction limits and senior citizen benefits'
  },
  'section_80e': {
    title: 'Section 80E (Education Loan)',
    content: 'Tax deduction on interest paid on education loans for higher studies.',
    category: 'deduction',
    priority: 'medium',
    aiPrompt: 'Education loan interest deduction rules and eligibility criteria'
  },
  'section_80g': {
    title: 'Section 80G (Donations)',
    content: 'Tax deduction for donations made to approved charitable organizations.',
    category: 'deduction',
    priority: 'medium',
    aiPrompt: 'Donation deduction rates and approved charitable institutions'
  },
  'section_80t': {
    title: 'Section 80TTB (Senior Citizens)',
    content: 'Tax deduction up to ₹50,000 on interest from savings accounts for senior citizens.',
    category: 'deduction',
    priority: 'medium',
    aiPrompt: 'Senior citizen tax benefits and savings account interest deduction'
  },

  // =====================================================
  // INVESTMENT TERMS
  // =====================================================
  'ppf': {
    title: 'PPF (Public Provident Fund)',
    content: 'Long-term tax-saving investment with guaranteed returns and tax-free maturity.',
    category: 'investment',
    priority: 'high',
    aiPrompt: 'PPF investment rules, interest rates, and tax benefits'
  },
  'elss': {
    title: 'ELSS (Equity Linked Savings Scheme)',
    content: 'Tax-saving mutual funds with 3-year lock-in period and potential for higher returns.',
    category: 'investment',
    priority: 'high',
    aiPrompt: 'ELSS funds benefits, risks, and how to choose the right fund'
  },
  'nps': {
    title: 'NPS (National Pension System)',
    content: 'Voluntary retirement savings scheme with additional tax benefits up to ₹50,000.',
    category: 'investment',
    priority: 'medium',
    aiPrompt: 'NPS benefits, contribution limits, and withdrawal rules'
  },
  'sukanya_samriddhi': {
    title: 'Sukanya Samriddhi Yojana',
    content: 'Tax-saving scheme for girl child with high interest rates and tax benefits.',
    category: 'investment',
    priority: 'medium',
    aiPrompt: 'Sukanya Samriddhi scheme benefits, eligibility, and investment process'
  },
  'ulip': {
    title: 'ULIP (Unit Linked Insurance Plan)',
    content: 'Combined insurance and investment product with tax benefits under Section 80C.',
    category: 'investment',
    priority: 'medium',
    aiPrompt: 'ULIP benefits, charges, and comparison with traditional insurance'
  },

  // =====================================================
  // TAX CALCULATION TERMS
  // =====================================================
  'tax_slab': {
    title: 'Tax Slab',
    content: 'Different tax rates applied based on income ranges (0%, 5%, 20%, 30%).',
    category: 'tax',
    priority: 'high',
    aiPrompt: 'Current tax slabs and how progressive taxation works'
  },
  'tax_liability': {
    title: 'Tax Liability',
    content: 'Total amount of tax you owe to the government for the financial year.',
    category: 'tax',
    priority: 'high',
    aiPrompt: 'How tax liability is calculated and factors affecting it'
  },
  'advance_tax': {
    title: 'Advance Tax',
    content: 'Tax paid in installments during the year if estimated tax exceeds ₹10,000.',
    category: 'tax',
    priority: 'medium',
    aiPrompt: 'Advance tax payment schedule and penalty for non-payment'
  },
  'self_assessment_tax': {
    title: 'Self Assessment Tax',
    content: 'Additional tax paid at the time of filing if advance tax was insufficient.',
    category: 'tax',
    priority: 'medium',
    aiPrompt: 'When to pay self assessment tax and how to calculate it'
  },
  'tax_refund': {
    title: 'Tax Refund',
    content: 'Money returned by government when taxes paid exceed actual tax liability.',
    category: 'tax',
    priority: 'high',
    aiPrompt: 'How tax refunds are processed and when to expect them'
  },
  'interest_on_refund': {
    title: 'Interest on Refund',
    content: 'Interest paid by government on delayed tax refunds at 6% per annum.',
    category: 'tax',
    priority: 'low',
    aiPrompt: 'Interest calculation on tax refunds and eligibility criteria'
  },

  // =====================================================
  // ITR FORMS & FILING
  // =====================================================
  'itr1': {
    title: 'ITR-1 (Sahaj)',
    content: 'Simplest ITR form for salaried individuals with income from salary, house property, and other sources.',
    category: 'filing',
    priority: 'high',
    aiPrompt: 'ITR-1 eligibility criteria and what income sources are allowed'
  },
  'itr2': {
    title: 'ITR-2',
    content: 'For individuals with income from salary, house property, capital gains, and foreign assets.',
    category: 'filing',
    priority: 'high',
    aiPrompt: 'ITR-2 filing requirements and capital gains reporting'
  },
  'itr3': {
    title: 'ITR-3',
    content: 'For individuals with business or profession income along with other income sources.',
    category: 'filing',
    priority: 'medium',
    aiPrompt: 'ITR-3 filing requirements and business income reporting'
  },
  'itr4': {
    title: 'ITR-4 (Sugam)',
    content: 'For individuals with presumptive income from business or profession under Section 44AD/44ADA.',
    category: 'filing',
    priority: 'medium',
    aiPrompt: 'ITR-4 eligibility and presumptive taxation benefits'
  },
  'acknowledgment': {
    title: 'ITR Acknowledgment (ITR-V)',
    content: 'Confirmation receipt after successful ITR filing that must be verified.',
    category: 'filing',
    priority: 'high',
    aiPrompt: 'How to verify ITR-V and what to do if verification fails'
  },
  'filing_deadline': {
    title: 'ITR Filing Deadline',
    content: 'Last date to file ITR is July 31st (extended to December 31st for FY 2023-24).',
    category: 'filing',
    priority: 'high',
    aiPrompt: 'ITR filing deadlines and penalties for late filing'
  },
  'late_filing_fee': {
    title: 'Late Filing Fee',
    content: 'Penalty of ₹5,000 (₹1,000 for income below ₹5 lakhs) for filing ITR after deadline.',
    category: 'filing',
    priority: 'high',
    aiPrompt: 'Late filing penalties and how to avoid them'
  },

  // =====================================================
  // CAPITAL GAINS TERMS
  // =====================================================
  'short_term_capital_gain': {
    title: 'Short Term Capital Gain',
    content: 'Profit from selling assets held for less than specified period (1 year for equity, 3 years for property).',
    category: 'capital_gains',
    priority: 'high',
    aiPrompt: 'Short term capital gains tax rates and holding period requirements'
  },
  'long_term_capital_gain': {
    title: 'Long Term Capital Gain',
    content: 'Profit from selling assets held for more than specified period with lower tax rates.',
    category: 'capital_gains',
    priority: 'high',
    aiPrompt: 'Long term capital gains tax rates and indexation benefits'
  },
  'indexation': {
    title: 'Indexation',
    content: 'Adjustment of asset cost using inflation index to reduce capital gains tax.',
    category: 'capital_gains',
    priority: 'medium',
    aiPrompt: 'How indexation works and its benefits for long term capital gains'
  },
  'ltcg_exemption': {
    title: 'LTCG Exemption',
    content: 'Tax exemption on long term capital gains up to ₹1 lakh from equity investments.',
    category: 'capital_gains',
    priority: 'high',
    aiPrompt: 'LTCG exemption limits and qualifying investments'
  },

  // =====================================================
  // HOUSE PROPERTY TERMS
  // =====================================================
  'annual_value': {
    title: 'Annual Value',
    content: 'Notional rent income from house property used for tax calculation.',
    category: 'house_property',
    priority: 'medium',
    aiPrompt: 'How annual value is calculated for different types of house property'
  },
  'standard_deduction_house': {
    title: 'Standard Deduction (House Property)',
    content: 'Fixed deduction of 30% from annual value for repairs and maintenance.',
    category: 'house_property',
    priority: 'medium',
    aiPrompt: 'Standard deduction for house property and other allowable deductions'
  },
  'home_loan_interest': {
    title: 'Home Loan Interest',
    content: 'Tax deduction on interest paid on home loan up to ₹2 lakhs per year.',
    category: 'house_property',
    priority: 'high',
    aiPrompt: 'Home loan interest deduction limits and eligibility criteria'
  },
  'principal_repayment': {
    title: 'Principal Repayment',
    content: 'Tax deduction on principal amount repaid on home loan under Section 80C.',
    category: 'house_property',
    priority: 'high',
    aiPrompt: 'Principal repayment deduction and Section 80C limits'
  },

  // =====================================================
  // BUSINESS & PROFESSION TERMS
  // =====================================================
  'presumptive_taxation': {
    title: 'Presumptive Taxation',
    content: 'Simplified tax calculation based on presumed income percentage (6% or 8%).',
    category: 'business',
    priority: 'medium',
    aiPrompt: 'Presumptive taxation benefits and eligibility criteria'
  },
  'business_expenses': {
    title: 'Business Expenses',
    content: 'Allowable deductions for expenses incurred in earning business income.',
    category: 'business',
    priority: 'medium',
    aiPrompt: 'What business expenses are deductible and documentation requirements'
  },
  'depreciation': {
    title: 'Depreciation',
    content: 'Tax deduction for wear and tear of business assets over their useful life.',
    category: 'business',
    priority: 'medium',
    aiPrompt: 'Depreciation rates and methods for different types of business assets'
  },

  // =====================================================
  // COMPLIANCE & PENALTIES
  // =====================================================
  'penalty_271f': {
    title: 'Penalty u/s 271F',
    content: 'Penalty of ₹10,000 for not filing ITR within due date.',
    category: 'penalty',
    priority: 'high',
    aiPrompt: 'Section 271F penalty and how to avoid it'
  },
  'interest_234a': {
    title: 'Interest u/s 234A',
    content: 'Interest at 1% per month for delay in filing ITR after due date.',
    category: 'penalty',
    priority: 'high',
    aiPrompt: 'Interest calculation under Section 234A and payment requirements'
  },
  'interest_234b': {
    title: 'Interest u/s 234B',
    content: 'Interest at 1% per month for non-payment or short payment of advance tax.',
    category: 'penalty',
    priority: 'medium',
    aiPrompt: 'Advance tax interest calculation and payment schedule'
  },
  'interest_234c': {
    title: 'Interest u/s 234C',
    content: 'Interest for deferment of advance tax installments.',
    category: 'penalty',
    priority: 'low',
    aiPrompt: 'Deferment of advance tax installments and interest implications'
  },

  // =====================================================
  // DIGITAL & TECHNOLOGY TERMS
  // =====================================================
  'digital_signature': {
    title: 'Digital Signature',
    content: 'Electronic signature used for secure online ITR filing and verification.',
    category: 'digital',
    priority: 'medium',
    aiPrompt: 'How to obtain digital signature and its benefits for ITR filing'
  },
  'e_verification': {
    title: 'E-Verification',
    content: 'Online verification of ITR using Aadhaar OTP, net banking, or demat account.',
    category: 'digital',
    priority: 'high',
    aiPrompt: 'Different methods of e-verification and their requirements'
  },
  'prefilled_itr': {
    title: 'Pre-filled ITR',
    content: 'ITR form automatically filled with data from Form 16, bank statements, and other sources.',
    category: 'digital',
    priority: 'high',
    aiPrompt: 'How to use pre-filled ITR and verify the data accuracy'
  },
  'form_26as': {
    title: 'Form 26AS',
    content: 'Annual tax statement showing TDS, advance tax, and other tax payments.',
    category: 'digital',
    priority: 'high',
    aiPrompt: 'How to download Form 26AS and reconcile with ITR data'
  },

  // =====================================================
  // SPECIAL CATEGORIES
  // =====================================================
  'nri_taxation': {
    title: 'NRI Taxation',
    content: 'Special tax rules for Non-Resident Indians based on residential status.',
    category: 'special',
    priority: 'medium',
    aiPrompt: 'NRI tax obligations and residential status determination'
  },
  'senior_citizen': {
    title: 'Senior Citizen Benefits',
    content: 'Additional tax benefits and higher deduction limits for taxpayers above 60 years.',
    category: 'special',
    priority: 'medium',
    aiPrompt: 'Senior citizen tax benefits and age-based deductions'
  },
  'super_senior_citizen': {
    title: 'Super Senior Citizen Benefits',
    content: 'Enhanced tax benefits for taxpayers above 80 years with higher deduction limits.',
    category: 'special',
    priority: 'medium',
    aiPrompt: 'Super senior citizen tax benefits and special provisions'
  },
  'women_taxpayer': {
    title: 'Women Taxpayer Benefits',
    content: 'Special tax benefits and exemptions available to women taxpayers.',
    category: 'special',
    priority: 'low',
    aiPrompt: 'Tax benefits specifically available to women taxpayers'
  }
};

// =====================================================
// CATEGORY CONFIGURATION
// =====================================================
export const TOOLTIP_CATEGORIES = {
  income: {
    name: 'Income & Earnings',
    color: 'blue',
    icon: 'TrendingUp'
  },
  tax: {
    name: 'Tax Calculation',
    color: 'red',
    icon: 'Calculator'
  },
  deduction: {
    name: 'Deductions',
    color: 'green',
    icon: 'Minus'
  },
  investment: {
    name: 'Investments',
    color: 'purple',
    icon: 'PiggyBank'
  },
  filing: {
    name: 'ITR Filing',
    color: 'orange',
    icon: 'FileText'
  },
  capital_gains: {
    name: 'Capital Gains',
    color: 'teal',
    icon: 'TrendingUp'
  },
  house_property: {
    name: 'House Property',
    color: 'indigo',
    icon: 'Home'
  },
  business: {
    name: 'Business & Profession',
    color: 'amber',
    icon: 'Briefcase'
  },
  penalty: {
    name: 'Penalties',
    color: 'red',
    icon: 'AlertTriangle'
  },
  digital: {
    name: 'Digital Filing',
    color: 'blue',
    icon: 'Monitor'
  },
  special: {
    name: 'Special Categories',
    color: 'pink',
    icon: 'Star'
  }
};

// =====================================================
// PRIORITY LEVELS
// =====================================================
export const TOOLTIP_PRIORITIES = {
  high: {
    name: 'High Priority',
    color: 'red',
    description: 'Essential terms every taxpayer should know'
  },
  medium: {
    name: 'Medium Priority',
    color: 'orange',
    description: 'Important terms for specific situations'
  },
  low: {
    name: 'Low Priority',
    color: 'green',
    description: 'Advanced terms for specialized knowledge'
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get tooltip content by key
 * @param {string} key - Tooltip key
 * @returns {object|null} Tooltip content or null if not found
 */
export const getTooltipContent = (key) => {
  return TOOLTIP_MASTER_LIST[key] || null;
};

/**
 * Get tooltips by category
 * @param {string} category - Category name
 * @returns {array} Array of tooltip objects
 */
export const getTooltipsByCategory = (category) => {
  return Object.entries(TOOLTIP_MASTER_LIST)
    .filter(([key, tooltip]) => tooltip.category === category)
    .map(([key, tooltip]) => ({ key, ...tooltip }));
};

/**
 * Get tooltips by priority
 * @param {string} priority - Priority level
 * @returns {array} Array of tooltip objects
 */
export const getTooltipsByPriority = (priority) => {
  return Object.entries(TOOLTIP_MASTER_LIST)
    .filter(([key, tooltip]) => tooltip.priority === priority)
    .map(([key, tooltip]) => ({ key, ...tooltip }));
};

/**
 * Search tooltips by keyword
 * @param {string} keyword - Search keyword
 * @returns {array} Array of matching tooltip objects
 */
export const searchTooltips = (keyword) => {
  const searchTerm = keyword.toLowerCase();
  return Object.entries(TOOLTIP_MASTER_LIST)
    .filter(([key, tooltip]) => 
      tooltip.title.toLowerCase().includes(searchTerm) ||
      tooltip.content.toLowerCase().includes(searchTerm) ||
      key.toLowerCase().includes(searchTerm)
    )
    .map(([key, tooltip]) => ({ key, ...tooltip }));
};

/**
 * Get AI prompt for tooltip
 * @param {string} key - Tooltip key
 * @returns {string} AI prompt for deeper explanation
 */
export const getAIPrompt = (key) => {
  const tooltip = getTooltipContent(key);
  return tooltip ? tooltip.aiPrompt : 'Explain this financial term in detail';
};

/**
 * Get all tooltip keys
 * @returns {array} Array of all tooltip keys
 */
export const getAllTooltipKeys = () => {
  return Object.keys(TOOLTIP_MASTER_LIST);
};

/**
 * Get tooltip statistics
 * @returns {object} Statistics about tooltips
 */
export const getTooltipStats = () => {
  const total = Object.keys(TOOLTIP_MASTER_LIST).length;
  const byCategory = {};
  const byPriority = {};

  Object.values(TOOLTIP_MASTER_LIST).forEach(tooltip => {
    byCategory[tooltip.category] = (byCategory[tooltip.category] || 0) + 1;
    byPriority[tooltip.priority] = (byPriority[tooltip.priority] || 0) + 1;
  });

  return {
    total,
    byCategory,
    byPriority,
    categories: Object.keys(byCategory).length,
    priorities: Object.keys(byPriority).length
  };
};

export default TOOLTIP_MASTER_LIST;
