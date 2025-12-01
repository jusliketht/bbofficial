// =====================================================
// ITR-3 CONFIGURATION
// Dynamic form field definitions for ITR-3
// For individuals and HUFs having income from business or profession
// =====================================================

export const ITR3_CONFIG = {
  type: 'ITR-3',
  name: 'ITR-3',
  description: 'For individuals and HUFs having income from business or profession',
  eligibility: {
    minAge: 18,
    maxAge: null,
    incomeSources: ['salary', 'business', 'professional', 'house_property', 'capital_gains', 'other_sources'],
    maxTotalIncome: null,
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
      id: 'business_income',
      title: 'Business Income',
      description: 'Details about business income and expenses',
      required: false,
      fields: [
        {
          id: 'has_business_income',
          label: 'Do you have business income?',
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
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'business_nature',
          label: 'Nature of Business',
          type: 'text',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'business_address',
          label: 'Business Address',
          type: 'textarea',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'gross_receipts',
          label: 'Gross Receipts/Turnover',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'opening_stock',
          label: 'Opening Stock',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'purchases',
          label: 'Purchases',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'closing_stock',
          label: 'Closing Stock',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'direct_expenses',
          label: 'Direct Expenses',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'indirect_expenses',
          label: 'Indirect Expenses',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'depreciation',
          label: 'Depreciation',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
        {
          id: 'net_profit',
          label: 'Net Profit from Business',
          type: 'number',
          required: false,
          conditional: { field: 'has_business_income', value: true },
        },
      ],
    },

    {
      id: 'professional_income',
      title: 'Professional Income',
      description: 'Details about professional income and expenses',
      required: false,
      fields: [
        {
          id: 'has_professional_income',
          label: 'Do you have professional income?',
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
          conditional: { field: 'has_professional_income', value: true },
        },
        {
          id: 'professional_fees',
          label: 'Professional Fees Received',
          type: 'number',
          required: false,
          conditional: { field: 'has_professional_income', value: true },
        },
        {
          id: 'professional_expenses',
          label: 'Professional Expenses',
          type: 'number',
          required: false,
          conditional: { field: 'has_professional_income', value: true },
        },
        {
          id: 'professional_depreciation',
          label: 'Depreciation on Professional Assets',
          type: 'number',
          required: false,
          conditional: { field: 'has_professional_income', value: true },
        },
        {
          id: 'net_professional_income',
          label: 'Net Professional Income',
          type: 'number',
          required: false,
          conditional: { field: 'has_professional_income', value: true },
        },
      ],
    },

    {
      id: 'balance_sheet',
      title: 'Balance Sheet',
      description: 'Balance sheet details (if applicable)',
      required: false,
      fields: [
        {
          id: 'has_balance_sheet',
          label: 'Do you maintain balance sheet?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'assets',
          label: 'Total Assets',
          type: 'number',
          required: false,
          conditional: { field: 'has_balance_sheet', value: true },
        },
        {
          id: 'liabilities',
          label: 'Total Liabilities',
          type: 'number',
          required: false,
          conditional: { field: 'has_balance_sheet', value: true },
        },
        {
          id: 'capital',
          label: 'Capital',
          type: 'number',
          required: false,
          conditional: { field: 'has_balance_sheet', value: true },
        },
      ],
    },

    {
      id: 'audit_information',
      title: 'Audit Information',
      description: 'Tax audit details if applicable',
      required: false,
      fields: [
        {
          id: 'is_audit_applicable',
          label: 'Is tax audit applicable?',
          type: 'radio',
          required: true,
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {
          id: 'audit_report_number',
          label: 'Audit Report Number',
          type: 'text',
          required: false,
          conditional: { field: 'is_audit_applicable', value: true },
        },
        {
          id: 'audit_date',
          label: 'Date of Audit Report',
          type: 'date',
          required: false,
          conditional: { field: 'is_audit_applicable', value: true },
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
          label: 'Short-term Capital Gains',
          type: 'number',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
        },
        {
          id: 'long_term_capital_gains',
          label: 'Long-term Capital Gains',
          type: 'number',
          required: false,
          conditional: { field: 'has_capital_gains', value: true },
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
        condition: 'business_income.has_business_income === true',
        required_fields: ['business_income.gross_receipts'],
      },
      {
        condition: 'professional_income.has_professional_income === true',
        required_fields: ['professional_income.professional_fees'],
      },
      {
        condition: 'audit_information.is_audit_applicable === true',
        required_fields: ['audit_information.audit_report_number', 'audit_information.audit_date'],
      },
    ],
  },
};

export default ITR3_CONFIG;

