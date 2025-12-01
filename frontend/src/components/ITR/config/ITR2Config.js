// =====================================================
// ITR-2 CONFIGURATION
// Dynamic form field definitions for ITR-2
// For individuals and HUFs having income from salary, house property, capital gains, other sources
// =====================================================

export const ITR2_CONFIG = {
  type: 'ITR-2',
  name: 'ITR-2',
  description: 'For individuals and HUFs having income from salary, house property, capital gains, and other sources',
  eligibility: {
    minAge: 18,
    maxAge: null,
    incomeSources: ['salary', 'house_property', 'capital_gains', 'other_sources'],
    maxTotalIncome: null, // No upper limit
    applicableFor: ['individual', 'huf'],
  },

  sections: [
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Basic details about the taxpayer',
      required: true,
      fields: [
        {
          id: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          validation: {
            minLength: 3,
            pattern: '^[a-zA-Z\\s]+$',
            message: 'Please enter a valid name (letters only, min 3 characters)',
          },
        },
        {
          id: 'pan',
          label: 'PAN Card Number',
          type: 'text',
          required: true,
          validation: {
            pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
            message: 'Please enter a valid PAN number',
          },
        },
        {
          id: 'aadhaar',
          label: 'Aadhaar Number',
          type: 'text',
          required: false,
          validation: {
            pattern: '^\\d{12}$',
            message: 'Please enter a valid 12-digit Aadhaar number',
          },
        },
        {
          id: 'dob',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          validation: {
            maxAge: 120,
            minAge: 18,
          },
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          validation: {
            pattern: '[^@]+@[^@]+\\.[^@]+',
            message: 'Please enter a valid email address',
          },
        },
        {
          id: 'phone',
          label: 'Mobile Number',
          type: 'tel',
          required: true,
          validation: {
            pattern: '[6-9]\\d{9}',
            message: 'Please enter a valid 10-digit mobile number',
          },
        },
        {
          id: 'address',
          label: 'Residential Address',
          type: 'textarea',
          required: true,
          validation: {
            minLength: 10,
            message: 'Please enter complete address (min 10 characters)',
          },
        },
        {
          id: 'residential_status',
          label: 'Residential Status',
          type: 'select',
          required: true,
          options: [
            { value: 'resident', label: 'Resident' },
            { value: 'non_resident', label: 'Non-Resident' },
            { value: 'not_ordinarily_resident', label: 'Not Ordinarily Resident' },
          ],
        },
      ],
    },

    {
      id: 'salary_income',
      title: 'Income from Salary',
      description: 'Details about salary income from employment',
      required: false,
      fields: [
        {
          id: 'has_salary_income',
          label: 'Do you have income from salary?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'employer_name',
          label: 'Employer Name',
          type: 'text',
          required: true,
          conditional: { field: 'has_salary_income', value: true },
        },
        {
          id: 'employer_pan',
          label: 'Employer PAN (TAN)',
          type: 'text',
          required: false,
          conditional: { field: 'has_salary_income', value: true },
        },
        {
          id: 'gross_salary',
          label: 'Gross Salary',
          type: 'number',
          required: true,
          conditional: { field: 'has_salary_income', value: true },
        },
        {
          id: 'perquisites',
          label: 'Value of Perquisites',
          type: 'number',
          required: false,
          conditional: { field: 'has_salary_income', value: true },
        },
        {
          id: 'profits_in_lieu_of_salary',
          label: 'Profits in Lieu of Salary',
          type: 'number',
          required: false,
          conditional: { field: 'has_salary_income', value: true },
        },
      ],
    },

    {
      id: 'house_properties',
      title: 'Income from House Property',
      description: 'Details about rental income from house properties (can have multiple)',
      required: false,
      fields: [
        {
          id: 'properties',
          label: 'House Properties',
          type: 'array',
          required: false,
          itemFields: [
            {
              id: 'property_type',
              label: 'Property Type',
              type: 'select',
              required: true,
              options: [
                { value: 'self_occupied', label: 'Self Occupied' },
                { value: 'let_out', label: 'Let Out' },
                { value: 'deemed_let_out', label: 'Deemed Let Out' },
              ],
            },
            {
              id: 'annual_rental_income',
              label: 'Annual Rental Income',
              type: 'number',
              required: true,
            },
            {
              id: 'municipal_taxes',
              label: 'Municipal Taxes Paid',
              type: 'number',
              required: false,
            },
            {
              id: 'interest_on_loan',
              label: 'Interest on Housing Loan',
              type: 'number',
              required: false,
            },
            {
              id: 'pre_construction_interest',
              label: 'Pre-construction Interest',
              type: 'number',
              required: false,
            },
            {
              id: 'property_address',
              label: 'Property Address',
              type: 'textarea',
              required: false,
            },
          ],
        },
      ],
    },

    {
      id: 'capital_gains',
      title: 'Capital Gains',
      description: 'Details about capital gains from sale of assets',
      required: false,
      fields: [
        {
          id: 'has_capital_gains',
          label: 'Do you have capital gains?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'short_term_capital_gains',
          label: 'Short-term Capital Gains (STCG)',
          type: 'number',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
        },
        {
          id: 'long_term_capital_gains',
          label: 'Long-term Capital Gains (LTCG)',
          type: 'number',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
        },
        {
          id: 'exempt_capital_gains',
          label: 'Exempt Capital Gains',
          type: 'number',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
        },
        {
          id: 'stcg_details',
          label: 'STCG Details',
          type: 'array',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
          itemFields: [
            {
              id: 'asset_type',
              label: 'Asset Type',
              type: 'select',
              options: [
                { value: 'equity_shares', label: 'Equity Shares' },
                { value: 'mutual_funds', label: 'Mutual Funds' },
                { value: 'property', label: 'Property' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              id: 'sale_value',
              label: 'Sale Value',
              type: 'number',
            },
            {
              id: 'purchase_value',
              label: 'Purchase Value',
              type: 'number',
            },
            {
              id: 'expenses',
              label: 'Expenses on Transfer',
              type: 'number',
            },
            {
              id: 'gain_amount',
              label: 'Gain Amount',
              type: 'number',
            },
          ],
        },
        {
          id: 'ltcg_details',
          label: 'LTCG Details',
          type: 'array',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
          itemFields: [
            {
              id: 'asset_type',
              label: 'Asset Type',
              type: 'select',
              options: [
                { value: 'equity_shares', label: 'Equity Shares' },
                { value: 'mutual_funds', label: 'Mutual Funds' },
                { value: 'property', label: 'Property' },
                { value: 'bonds', label: 'Bonds' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              id: 'sale_value',
              label: 'Sale Value',
              type: 'number',
            },
            {
              id: 'indexed_cost',
              label: 'Indexed Cost of Acquisition',
              type: 'number',
            },
            {
              id: 'expenses',
              label: 'Expenses on Transfer',
              type: 'number',
            },
            {
              id: 'gain_amount',
              label: 'Gain Amount',
              type: 'number',
            },
          ],
        },
      ],
    },

    {
      id: 'foreign_income',
      title: 'Foreign Income',
      description: 'Income from foreign sources and DTAA claims',
      required: false,
      fields: [
        {
          id: 'has_foreign_income',
          label: 'Do you have foreign income?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'foreign_income_details',
          label: 'Foreign Income Details',
          type: 'array',
          required: false,
          conditional: { field: 'has_foreign_income', value: true },
          itemFields: [
            {
              id: 'country',
              label: 'Country',
              type: 'text',
            },
            {
              id: 'income_type',
              label: 'Income Type',
              type: 'select',
              options: [
                { value: 'salary', label: 'Salary' },
                { value: 'business', label: 'Business' },
                { value: 'capital_gains', label: 'Capital Gains' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              id: 'amount',
              label: 'Amount (in Foreign Currency)',
              type: 'number',
            },
            {
              id: 'exchange_rate',
              label: 'Exchange Rate',
              type: 'number',
            },
            {
              id: 'amount_inr',
              label: 'Amount in INR',
              type: 'number',
            },
            {
              id: 'tax_paid_abroad',
              label: 'Tax Paid Abroad',
              type: 'number',
            },
            {
              id: 'dtaa_applicable',
              label: 'DTAA Applicable',
              type: 'checkbox',
            },
          ],
        },
      ],
    },

    {
      id: 'agricultural_income',
      title: 'Agricultural Income',
      description: 'Income from agricultural activities',
      required: false,
      fields: [
        {
          id: 'has_agricultural_income',
          label: 'Do you have agricultural income?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'agricultural_income_amount',
          label: 'Agricultural Income Amount',
          type: 'number',
          required: false,
          conditional: { field: 'has_agricultural_income', value: true },
        },
      ],
    },

    {
      id: 'director_partner_income',
      title: 'Director/Partner Income',
      description: 'Income as director or partner',
      required: false,
      fields: [
        {
          id: 'is_director',
          label: 'Are you a director?',
          type: 'checkbox',
          required: false,
        },
        {
          id: 'director_income',
          label: 'Director Income',
          type: 'number',
          required: false,
          conditional: { field: 'is_director', value: true },
        },
        {
          id: 'is_partner',
          label: 'Are you a partner?',
          type: 'checkbox',
          required: false,
        },
        {
          id: 'partner_income',
          label: 'Partner Income',
          type: 'number',
          required: false,
          conditional: { field: 'is_partner', value: true },
        },
      ],
    },

    {
      id: 'other_income',
      title: 'Other Income',
      description: 'Income from other sources like interest, dividends, etc.',
      required: false,
      fields: [
        {
          id: 'interest_income',
          label: 'Interest Income',
          type: 'number',
          required: false,
        },
        {
          id: 'dividend_income',
          label: 'Dividend Income',
          type: 'number',
          required: false,
        },
        {
          id: 'other_sources',
          label: 'Income from Other Sources',
          type: 'number',
          required: false,
        },
      ],
    },

    {
      id: 'deductions',
      title: 'Deductions under Chapter VI-A',
      description: 'Tax deductions available under various sections',
      required: false,
      fields: [
        {
          id: 'section_80c',
          label: 'Section 80C (PPF, EPF, Life Insurance, etc.)',
          type: 'number',
          required: false,
          max: 150000,
          validation: {
            min: 0,
            max: 150000,
            message: '80C deduction must be between 0 and ₹1.5 lakh',
          },
        },
        {
          id: 'section_80d',
          label: 'Section 80D (Health Insurance)',
          type: 'number',
          required: false,
        },
        {
          id: 'section_80e',
          label: 'Section 80E (Education Loan Interest)',
          type: 'number',
          required: false,
        },
        {
          id: 'section_80g',
          label: 'Section 80G (Donations)',
          type: 'number',
          required: false,
        },
        {
          id: 'section_80tta',
          label: 'Section 80TTA (Interest on Savings Account)',
          type: 'number',
          required: false,
          max: 10000,
        },
        {
          id: 'section_80ttb',
          label: 'Section 80TTB (Interest Income for Senior Citizens)',
          type: 'number',
          required: false,
          max: 50000,
        },
        {
          id: 'other_deductions',
          label: 'Other Deductions',
          type: 'number',
          required: false,
        },
      ],
    },

    {
      id: 'taxes_paid',
      title: 'Taxes Paid',
      description: 'Details of advance tax and self-assessment tax paid',
      required: false,
      fields: [
        {
          id: 'advance_tax',
          label: 'Advance Tax Paid',
          type: 'number',
          required: false,
        },
        {
          id: 'tds_tcs',
          label: 'TDS/TCS',
          type: 'number',
          required: false,
        },
        {
          id: 'self_assessment_tax',
          label: 'Self Assessment Tax',
          type: 'number',
          required: false,
        },
      ],
    },
  ],

  validation: {
    required_sections: ['personal_info'],
    conditional_rules: [
      {
        condition: 'salary_income.has_salary_income === true',
        required_fields: ['salary_income.employer_name', 'salary_income.gross_salary'],
      },
      {
        condition: 'capital_gains.has_capital_gains === true',
        required_fields: ['capital_gains.short_term_capital_gains', 'capital_gains.long_term_capital_gains'],
      },
      {
        condition: 'foreign_income.has_foreign_income === true',
        required_fields: ['foreign_income.foreign_income_details'],
      },
    ],
  },
};

export default ITR2_CONFIG;

