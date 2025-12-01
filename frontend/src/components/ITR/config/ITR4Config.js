// =====================================================
// ITR-4 CONFIGURATION
// Dynamic form field definitions for ITR-4 (Sugam)
// For individuals and HUFs having presumptive business income
// =====================================================

export const ITR4_CONFIG = {
  type: 'ITR-4',
  name: 'ITR-4 (Sugam)',
  description: 'For individuals and HUFs having presumptive business income (turnover up to ₹2 crores)',
  eligibility: {
    minAge: 18,
    maxAge: null,
    incomeSources: ['salary', 'business', 'professional', 'house_property', 'other_sources'],
    maxTotalIncome: null,
    maxTurnover: 20000000, // ₹2 crores
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
        },
        {
          id: 'dob',
          label: 'Date of Birth',
          type: 'date',
          required: true,
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        {
          id: 'phone',
          label: 'Mobile Number',
          type: 'tel',
          required: true,
        },
        {
          id: 'address',
          label: 'Residential Address',
          type: 'textarea',
          required: true,
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
      id: 'presumptive_business',
      title: 'Presumptive Business Income',
      description: 'Business income under presumptive taxation scheme',
      required: false,
      fields: [
        {
          id: 'has_presumptive_business',
          label: 'Do you have presumptive business income?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'business_name',
          label: 'Business Name',
          type: 'text',
          required: false,
          conditional: { field: 'has_presumptive_business', value: true },
        },
        {
          id: 'business_nature',
          label: 'Nature of Business',
          type: 'text',
          required: false,
          conditional: { field: 'has_presumptive_business', value: true },
        },
        {
          id: 'gross_receipts',
          label: 'Gross Receipts/Turnover',
          type: 'number',
          required: false,
          conditional: { field: 'has_presumptive_business', value: true },
          validation: {
            max: 20000000,
            message: 'Turnover should not exceed ₹2 crores for ITR-4',
          },
        },
        {
          id: 'presumptive_rate',
          label: 'Presumptive Rate (%)',
          type: 'select',
          required: false,
          conditional: { field: 'has_presumptive_business', value: true },
          options: [
            { value: 8, label: '8% (Digital Receipts)' },
            { value: 6, label: '6% (Digital Receipts)' },
            { value: 5, label: '5% (Non-Digital Receipts)' },
          ],
        },
        {
          id: 'presumptive_income',
          label: 'Presumptive Income (Auto-calculated)',
          type: 'number',
          required: false,
          conditional: { field: 'has_presumptive_business', value: true },
          readonly: true,
        },
      ],
    },

    {
      id: 'presumptive_professional',
      title: 'Presumptive Professional Income',
      description: 'Professional income under presumptive taxation scheme',
      required: false,
      fields: [
        {
          id: 'has_presumptive_professional',
          label: 'Do you have presumptive professional income?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'profession_name',
          label: 'Profession Name',
          type: 'text',
          required: false,
          conditional: { field: 'has_presumptive_professional', value: true },
        },
        {
          id: 'gross_receipts_professional',
          label: 'Gross Receipts',
          type: 'number',
          required: false,
          conditional: { field: 'has_presumptive_professional', value: true },
          validation: {
            max: 50000000,
            message: 'Gross receipts should not exceed ₹5 crores for professionals',
          },
        },
        {
          id: 'presumptive_rate_professional',
          label: 'Presumptive Rate (%)',
          type: 'select',
          required: false,
          conditional: { field: 'has_presumptive_professional', value: true },
          options: [
            { value: 50, label: '50% (Presumptive Rate)' },
          ],
        },
        {
          id: 'presumptive_professional_income',
          label: 'Presumptive Professional Income (Auto-calculated)',
          type: 'number',
          required: false,
          conditional: { field: 'has_presumptive_professional', value: true },
          readonly: true,
        },
      ],
    },

    {
      id: 'simplified_pl',
      title: 'Simplified Profit & Loss',
      description: 'Basic income and expense details (if not using presumptive)',
      required: false,
      fields: [
        {
          id: 'use_simplified_pl',
          label: 'Use Simplified P&L?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'total_income',
          label: 'Total Income',
          type: 'number',
          required: false,
          conditional: { field: 'use_simplified_pl', value: true },
        },
        {
          id: 'total_expenses',
          label: 'Total Expenses',
          type: 'number',
          required: false,
          conditional: { field: 'use_simplified_pl', value: true },
        },
        {
          id: 'net_profit',
          label: 'Net Profit',
          type: 'number',
          required: false,
          conditional: { field: 'use_simplified_pl', value: true },
          readonly: true,
        },
      ],
    },

    {
      id: 'advance_tax_details',
      title: 'Advance Tax Details',
      description: 'Quarterly advance tax payment breakdown',
      required: false,
      fields: [
        {
          id: 'q1_advance_tax',
          label: 'Q1 Advance Tax (15th June)',
          type: 'number',
          required: false,
        },
        {
          id: 'q2_advance_tax',
          label: 'Q2 Advance Tax (15th September)',
          type: 'number',
          required: false,
        },
        {
          id: 'q3_advance_tax',
          label: 'Q3 Advance Tax (15th December)',
          type: 'number',
          required: false,
        },
        {
          id: 'q4_advance_tax',
          label: 'Q4 Advance Tax (15th March)',
          type: 'number',
          required: false,
        },
        {
          id: 'total_advance_tax',
          label: 'Total Advance Tax',
          type: 'number',
          required: false,
          readonly: true,
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
          id: 'gross_salary',
          label: 'Gross Salary',
          type: 'number',
          required: false,
          conditional: { field: 'has_salary_income', value: true },
        },
      ],
    },

    {
      id: 'house_properties',
      title: 'Income from House Property',
      description: 'Details about rental income from house properties',
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
            },
            {
              id: 'municipal_taxes',
              label: 'Municipal Taxes Paid',
              type: 'number',
            },
            {
              id: 'interest_on_loan',
              label: 'Interest on Housing Loan',
              type: 'number',
            },
          ],
        },
      ],
    },

    {
      id: 'other_income',
      title: 'Other Income',
      description: 'Income from other sources',
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
          label: 'Section 80C',
          type: 'number',
          required: false,
          max: 150000,
        },
        {
          id: 'section_80d',
          label: 'Section 80D',
          type: 'number',
          required: false,
        },
        {
          id: 'section_80g',
          label: 'Section 80G',
          type: 'number',
          required: false,
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
        condition: 'presumptive_business.has_presumptive_business === true',
        required_fields: ['presumptive_business.gross_receipts', 'presumptive_business.presumptive_rate'],
      },
      {
        condition: 'presumptive_professional.has_presumptive_professional === true',
        required_fields: ['presumptive_professional.gross_receipts_professional'],
      },
    ],
  },
};

export default ITR4_CONFIG;

