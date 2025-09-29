// 🗄️ DATA ARCHITECTURE FOR ITR JOURNEY

// ITR JSON Schema Generator
class ITRJSONSchemaGenerator {
  constructor() {
    this.itrSchemas = {
      'ITR-1': {
        schema: {
          personalInfo: {
            required: ['name', 'pan', 'aadhaar', 'mobile', 'email', 'address'],
            optional: ['fatherName', 'motherName', 'spouseName'],
            fields: {
              name: { type: 'text', validation: { minLength: 2, maxLength: 100 } },
              pan: { type: 'text', validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' } },
              aadhaar: { type: 'text', validation: { pattern: '^[0-9]{12}$' } },
              mobile: { type: 'text', validation: { pattern: '^[6-9][0-9]{9}$' } },
              email: { type: 'email', validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
              address: { type: 'textarea', validation: { minLength: 10 } }
            }
          },
          incomeSources: {
            salary: { 
              required: true, 
              fields: ['amount', 'employer', 'form16'],
              validation: { maxAmount: 500000 }
            },
            houseProperty: { 
              required: false, 
              fields: ['type', 'amount'],
              validation: { maxAmount: 500000 }
            },
            otherSources: { 
              required: false, 
              fields: ['type', 'amount', 'details'],
              validation: { maxAmount: 500000 }
            }
          },
          deductions: {
            section80C: { limit: 150000, required: false },
            section80D: { limit: 25000, required: false },
            section80TTA: { limit: 10000, required: false }
          },
          documents: {
            required: ['pan_card', 'form16'],
            optional: ['bank_statement', 'investment_proof']
          }
        },
        validationRules: {
          maxIncome: 500000,
          allowedSources: ['salary', 'houseProperty', 'otherSources'],
          restrictedSources: ['business', 'capitalGains']
        }
      },
      
      'ITR-2': {
        schema: {
          personalInfo: {
            required: ['name', 'pan', 'aadhaar', 'mobile', 'email', 'address'],
            optional: ['fatherName', 'motherName', 'spouseName'],
            fields: {
              name: { type: 'text', validation: { minLength: 2, maxLength: 100 } },
              pan: { type: 'text', validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' } },
              aadhaar: { type: 'text', validation: { pattern: '^[0-9]{12}$' } },
              mobile: { type: 'text', validation: { pattern: '^[6-9][0-9]{9}$' } },
              email: { type: 'email', validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
              address: { type: 'textarea', validation: { minLength: 10 } }
            }
          },
          incomeSources: {
            salary: { 
              required: true, 
              fields: ['amount', 'employer', 'form16'],
              validation: { maxAmount: 1000000 }
            },
            houseProperty: { 
              required: false, 
              fields: ['type', 'amount', 'rentalIncome'],
              validation: { maxAmount: 1000000 }
            },
            capitalGains: { 
              required: false, 
              fields: ['type', 'amount', 'holdingPeriod'],
              validation: { maxAmount: 1000000 }
            },
            otherSources: { 
              required: false, 
              fields: ['type', 'amount', 'details'],
              validation: { maxAmount: 1000000 }
            }
          },
          deductions: {
            section80C: { limit: 150000, required: false },
            section80D: { limit: 25000, required: false },
            section80TTA: { limit: 10000, required: false },
            section80G: { limit: Infinity, required: false }
          },
          documents: {
            required: ['pan_card', 'form16'],
            optional: ['bank_statement', 'investment_proof', 'capital_gains_proof']
          }
        },
        validationRules: {
          maxIncome: 1000000,
          allowedSources: ['salary', 'houseProperty', 'capitalGains', 'otherSources'],
          restrictedSources: ['business']
        }
      },
      
      'ITR-3': {
        schema: {
          personalInfo: {
            required: ['name', 'pan', 'aadhaar', 'mobile', 'email', 'address'],
            optional: ['fatherName', 'motherName', 'spouseName'],
            fields: {
              name: { type: 'text', validation: { minLength: 2, maxLength: 100 } },
              pan: { type: 'text', validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' } },
              aadhaar: { type: 'text', validation: { pattern: '^[0-9]{12}$' } },
              mobile: { type: 'text', validation: { pattern: '^[6-9][0-9]{9}$' } },
              email: { type: 'email', validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
              address: { type: 'textarea', validation: { minLength: 10 } }
            }
          },
          incomeSources: {
            salary: { 
              required: false, 
              fields: ['amount', 'employer', 'form16'],
              validation: { maxAmount: Infinity }
            },
            houseProperty: { 
              required: false, 
              fields: ['type', 'amount', 'rentalIncome'],
              validation: { maxAmount: Infinity }
            },
            business: { 
              required: true, 
              fields: ['type', 'turnover', 'profit', 'expenses'],
              validation: { maxAmount: Infinity }
            },
            capitalGains: { 
              required: false, 
              fields: ['type', 'amount', 'holdingPeriod'],
              validation: { maxAmount: Infinity }
            },
            otherSources: { 
              required: false, 
              fields: ['type', 'amount', 'details'],
              validation: { maxAmount: Infinity }
            }
          },
          deductions: {
            section80C: { limit: 150000, required: false },
            section80D: { limit: 25000, required: false },
            section80TTA: { limit: 10000, required: false },
            section80G: { limit: Infinity, required: false },
            section24: { limit: 200000, required: false }
          },
          documents: {
            required: ['pan_card', 'business_registration'],
            optional: ['form16', 'bank_statement', 'investment_proof', 'capital_gains_proof']
          }
        },
        validationRules: {
          maxIncome: Infinity,
          allowedSources: ['salary', 'houseProperty', 'business', 'capitalGains', 'otherSources'],
          restrictedSources: []
        }
      },
      
      'ITR-4': {
        schema: {
          personalInfo: {
            required: ['name', 'pan', 'aadhaar', 'mobile', 'email', 'address'],
            optional: ['fatherName', 'motherName', 'spouseName'],
            fields: {
              name: { type: 'text', validation: { minLength: 2, maxLength: 100 } },
              pan: { type: 'text', validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' } },
              aadhaar: { type: 'text', validation: { pattern: '^[0-9]{12}$' } },
              mobile: { type: 'text', validation: { pattern: '^[6-9][0-9]{9}$' } },
              email: { type: 'email', validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
              address: { type: 'textarea', validation: { minLength: 10 } }
            }
          },
          incomeSources: {
            salary: { 
              required: false, 
              fields: ['amount', 'employer', 'form16'],
              validation: { maxAmount: 2000000 }
            },
            houseProperty: { 
              required: false, 
              fields: ['type', 'amount', 'rentalIncome'],
              validation: { maxAmount: 2000000 }
            },
            business: { 
              required: true, 
              fields: ['type', 'turnover', 'presumptiveRate'],
              validation: { maxAmount: 2000000 }
            },
            otherSources: { 
              required: false, 
              fields: ['type', 'amount', 'details'],
              validation: { maxAmount: 2000000 }
            }
          },
          deductions: {
            section80C: { limit: 150000, required: false },
            section80D: { limit: 25000, required: false },
            section80TTA: { limit: 10000, required: false }
          },
          documents: {
            required: ['pan_card', 'business_registration'],
            optional: ['form16', 'bank_statement']
          }
        },
        validationRules: {
          maxIncome: 2000000,
          allowedSources: ['salary', 'houseProperty', 'business', 'otherSources'],
          restrictedSources: ['capitalGains']
        }
      }
    };
  }

  // Generate ITR-specific JSON schema
  generateITRSchema(itrType, userProfile = {}) {
    const baseSchema = this.itrSchemas[itrType];
    const customizedSchema = this.customizeSchema(baseSchema, userProfile);
    
    return {
      itrType: itrType,
      schema: customizedSchema,
      validationRules: baseSchema.validationRules,
      formConfig: this.generateFormConfig(customizedSchema),
      documentRequirements: this.getDocumentRequirements(customizedSchema),
      estimatedTime: this.estimateCompletionTime(customizedSchema)
    };
  }

  // Customize schema based on user profile
  customizeSchema(baseSchema, userProfile) {
    const customized = JSON.parse(JSON.stringify(baseSchema));
    
    // Remove unnecessary fields based on user profile
    if (userProfile.incomeSources) {
      Object.keys(customized.incomeSources).forEach(source => {
        if (!userProfile.incomeSources[source]) {
          delete customized.incomeSources[source];
        }
      });
    }
    
    // Adjust deduction limits based on income
    if (userProfile.totalIncome) {
      Object.keys(customized.deductions).forEach(deduction => {
        if (userProfile.totalIncome < 500000) {
          customized.deductions[deduction].limit = Math.min(
            customized.deductions[deduction].limit,
            userProfile.totalIncome * 0.3
          );
        }
      });
    }
    
    return customized;
  }

  // Generate form configuration
  generateFormConfig(schema) {
    return {
      steps: this.generateSteps(schema),
      fields: this.generateFields(schema),
      validations: this.generateValidations(schema),
      dependencies: this.generateDependencies(schema)
    };
  }

  // Generate form steps
  generateSteps(schema) {
    const steps = [
      { id: 1, title: 'Personal Information', fields: Object.keys(schema.personalInfo.required) },
      { id: 2, title: 'Income Sources', fields: Object.keys(schema.incomeSources) },
      { id: 3, title: 'Deductions', fields: Object.keys(schema.deductions) },
      { id: 4, title: 'Documents', fields: schema.documents.required },
      { id: 5, title: 'Review & Submit', fields: [] }
    ];
    
    return steps.filter(step => step.fields.length > 0);
  }

  // Generate field configurations
  generateFields(schema) {
    const fields = {};
    
    // Personal info fields
    Object.entries(schema.personalInfo.fields).forEach(([fieldName, config]) => {
      fields[fieldName] = {
        ...config,
        required: schema.personalInfo.required.includes(fieldName),
        section: 'personalInfo'
      };
    });
    
    // Income source fields
    Object.entries(schema.incomeSources).forEach(([sourceName, config]) => {
      config.fields.forEach(fieldName => {
        fields[`${sourceName}_${fieldName}`] = {
          type: fieldName === 'amount' ? 'number' : 'text',
          required: config.required,
          section: 'incomeSources',
          source: sourceName,
          validation: config.validation
        };
      });
    });
    
    // Deduction fields
    Object.entries(schema.deductions).forEach(([deductionName, config]) => {
      fields[deductionName] = {
        type: 'number',
        required: config.required,
        section: 'deductions',
        limit: config.limit,
        validation: { max: config.limit }
      };
    });
    
    return fields;
  }

  // Generate validation rules
  generateValidations(schema) {
    const validations = {};
    
    Object.entries(schema.personalInfo.fields).forEach(([fieldName, config]) => {
      validations[fieldName] = config.validation;
    });
    
    Object.entries(schema.incomeSources).forEach(([sourceName, config]) => {
      validations[sourceName] = config.validation;
    });
    
    Object.entries(schema.deductions).forEach(([deductionName, config]) => {
      validations[deductionName] = { max: config.limit };
    });
    
    return validations;
  }

  // Generate field dependencies
  generateDependencies(schema) {
    const dependencies = {};
    
    // Income source dependencies
    Object.keys(schema.incomeSources).forEach(sourceName => {
      dependencies[`${sourceName}_amount`] = [`${sourceName}_hasIncome`];
    });
    
    // Deduction dependencies
    Object.keys(schema.deductions).forEach(deductionName => {
      dependencies[deductionName] = ['totalIncome'];
    });
    
    return dependencies;
  }

  // Get document requirements
  getDocumentRequirements(schema) {
    return {
      required: schema.documents.required,
      optional: schema.documents.optional,
      total: schema.documents.required.length + schema.documents.optional.length
    };
  }

  // Estimate completion time
  estimateCompletionTime(schema) {
    const baseTime = 10; // 10 minutes base
    const personalInfoTime = 3;
    const incomeSourcesTime = Object.keys(schema.incomeSources).length * 2;
    const deductionsTime = Object.keys(schema.deductions).length * 1;
    const documentsTime = schema.documents.required.length * 2;
    
    return baseTime + personalInfoTime + incomeSourcesTime + deductionsTime + documentsTime;
  }
}

// Tax Computation Data Structure
class TaxComputationData {
  constructor() {
    this.taxSlabs = {
      newRegime: {
        2024: [
          { min: 0, max: 300000, rate: 0 },
          { min: 300000, max: 600000, rate: 0.05 },
          { min: 600000, max: 900000, rate: 0.10 },
          { min: 900000, max: 1200000, rate: 0.15 },
          { min: 1200000, max: 1500000, rate: 0.20 },
          { min: 1500000, max: Infinity, rate: 0.30 }
        ]
      },
      oldRegime: {
        2024: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250000, max: 500000, rate: 0.05 },
          { min: 500000, max: 1000000, rate: 0.20 },
          { min: 1000000, max: Infinity, rate: 0.30 }
        ]
      }
    };
    
    this.deductionLimits = {
      section80C: 150000,
      section80D: 25000,
      section80TTA: 10000,
      section80G: Infinity,
      section24: 200000
    };
  }

  // Calculate tax liability
  calculateTax(incomeData, deductions, regime = 'newRegime') {
    const taxableIncome = this.calculateTaxableIncome(incomeData, deductions, regime);
    const taxLiability = this.calculateTaxLiability(taxableIncome, regime);
    const effectiveRate = this.calculateEffectiveRate(taxLiability, incomeData.totalIncome);
    
    return {
      taxableIncome: taxableIncome,
      taxLiability: taxLiability,
      effectiveRate: effectiveRate,
      regime: regime,
      breakdown: this.getTaxBreakdown(taxableIncome, regime),
      optimization: this.getOptimizationSuggestions(incomeData, deductions, regime)
    };
  }

  // Calculate taxable income
  calculateTaxableIncome(incomeData, deductions, regime) {
    const totalIncome = incomeData.totalIncome || 0;
    const totalDeductions = this.calculateTotalDeductions(deductions, regime);
    return Math.max(0, totalIncome - totalDeductions);
  }

  // Calculate total deductions
  calculateTotalDeductions(deductions, regime) {
    let total = 0;
    
    Object.entries(deductions).forEach(([section, amount]) => {
      if (regime === 'oldRegime' || this.isNewRegimeDeduction(section)) {
        total += Math.min(amount, this.deductionLimits[section] || Infinity);
      }
    });
    
    return total;
  }

  // Check if deduction is allowed in new regime
  isNewRegimeDeduction(section) {
    const newRegimeDeductions = ['section80C', 'section80D', 'section80TTA'];
    return newRegimeDeductions.includes(section);
  }

  // Calculate tax liability
  calculateTaxLiability(taxableIncome, regime) {
    const slabs = this.taxSlabs[regime][2024];
    let tax = 0;
    
    slabs.forEach(slab => {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        tax += taxableInSlab * slab.rate;
      }
    });
    
    return tax;
  }

  // Calculate effective rate
  calculateEffectiveRate(taxLiability, totalIncome) {
    return totalIncome > 0 ? (taxLiability / totalIncome) * 100 : 0;
  }

  // Get tax breakdown
  getTaxBreakdown(taxableIncome, regime) {
    const slabs = this.taxSlabs[regime][2024];
    const breakdown = [];
    
    slabs.forEach(slab => {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        breakdown.push({
          slab: `${slab.min.toLocaleString()} - ${slab.max === Infinity ? '∞' : slab.max.toLocaleString()}`,
          taxableAmount: taxableInSlab,
          rate: slab.rate * 100,
          tax: taxableInSlab * slab.rate
        });
      }
    });
    
    return breakdown;
  }

  // Get optimization suggestions
  getOptimizationSuggestions(incomeData, deductions, regime) {
    const suggestions = [];
    
    // Section 80C optimization
    if (deductions.section80C < 150000) {
      const available = 150000 - deductions.section80C;
      suggestions.push({
        type: 'deduction',
        section: '80C',
        current: deductions.section80C,
        available: available,
        potentialSavings: available * 0.30,
        suggestions: ['ELSS funds', 'PPF', 'EPF', 'Life insurance']
      });
    }
    
    // Section 80D optimization
    if (deductions.section80D < 25000) {
      const available = 25000 - deductions.section80D;
      suggestions.push({
        type: 'deduction',
        section: '80D',
        current: deductions.section80D,
        available: available,
        potentialSavings: available * 0.30,
        suggestions: ['Health insurance', 'Medical expenses']
      });
    }
    
    return suggestions;
  }

  // Compare tax regimes
  compareRegimes(incomeData, deductions) {
    const newRegimeTax = this.calculateTax(incomeData, deductions, 'newRegime');
    const oldRegimeTax = this.calculateTax(incomeData, deductions, 'oldRegime');
    
    const savings = oldRegimeTax.taxLiability - newRegimeTax.taxLiability;
    const recommendedRegime = savings > 0 ? 'oldRegime' : 'newRegime';
    
    return {
      newRegime: newRegimeTax,
      oldRegime: oldRegimeTax,
      savings: Math.abs(savings),
      recommendedRegime: recommendedRegime,
      recommendation: this.getRegimeRecommendation(savings)
    };
  }

  // Get regime recommendation
  getRegimeRecommendation(savings) {
    if (savings > 10000) {
      return 'Old regime offers significant tax savings';
    } else if (savings > 0) {
      return 'Old regime offers modest tax savings';
    } else if (savings < -10000) {
      return 'New regime offers significant tax savings';
    } else {
      return 'New regime offers modest tax savings';
    }
  }
}

// Income Source Data Structure
class IncomeSourceData {
  constructor() {
    this.incomeSources = {
      salary: {
        types: ['regular', 'contract', 'freelance', 'pension'],
        validations: ['employer_verification', 'form16_validation'],
        edgeCases: ['multiple_employers', 'arrears', 'bonus']
      },
      houseProperty: {
        types: ['self_occupied', 'let_out', 'deemed_let'],
        validations: ['property_details', 'rental_income'],
        edgeCases: ['multiple_properties', 'construction_period', 'joint_ownership']
      },
      business: {
        types: ['sole_proprietorship', 'partnership', 'huf'],
        validations: ['business_registration', 'turnover_verification'],
        edgeCases: ['presumptive_taxation', 'audit_required', 'multiple_businesses']
      },
      capitalGains: {
        types: ['equity', 'debt', 'property', 'crypto'],
        validations: ['holding_period', 'cost_basis'],
        edgeCases: ['bonus_shares', 'stock_splits', 'foreign_assets']
      },
      otherSources: {
        types: ['interest', 'dividend', 'royalty', 'foreign_income'],
        validations: ['source_verification', 'tax_deduction'],
        edgeCases: ['exempt_income', 'clubbing_provisions', 'deemed_income']
      }
    };
  }

  // Aggregate income sources
  aggregateIncomeSources(incomeData) {
    const aggregation = {
      totalIncome: 0,
      taxableIncome: 0,
      exemptIncome: 0,
      sourceBreakdown: {},
      complianceChecks: []
    };
    
    Object.entries(incomeData).forEach(([sourceType, data]) => {
      if (data.hasIncome) {
        const sourceAggregation = this.aggregateSource(sourceType, data);
        
        aggregation.totalIncome += sourceAggregation.totalIncome;
        aggregation.taxableIncome += sourceAggregation.taxableIncome;
        aggregation.exemptIncome += sourceAggregation.exemptIncome;
        aggregation.sourceBreakdown[sourceType] = sourceAggregation;
        aggregation.complianceChecks.push(...sourceAggregation.complianceChecks);
      }
    });
    
    return aggregation;
  }

  // Aggregate individual source
  aggregateSource(sourceType, data) {
    const amount = data.amount || 0;
    
    return {
      totalIncome: amount,
      taxableIncome: amount, // Simplified - no exemptions for now
      exemptIncome: 0,
      complianceChecks: this.getComplianceChecks(sourceType, data),
      edgeCases: this.detectEdgeCases(sourceType, data)
    };
  }

  // Get compliance checks
  getComplianceChecks(sourceType, data) {
    const checks = [];
    
    if (sourceType === 'salary' && data.amount > 1000000) {
      checks.push({
        type: 'high_salary',
        message: 'Salary exceeds ₹10 lakhs - consider tax planning',
        severity: 'warning'
      });
    }
    
    if (sourceType === 'business' && data.amount > 2000000) {
      checks.push({
        type: 'audit_required',
        message: 'Business income exceeds ₹20 lakhs - audit required',
        severity: 'error'
      });
    }
    
    return checks;
  }

  // Detect edge cases
  detectEdgeCases(sourceType, data) {
    const edgeCases = [];
    
    if (sourceType === 'salary' && data.multipleEmployers) {
      edgeCases.push({
        type: 'multiple_employers',
        message: 'Multiple employers detected',
        action: 'Consider ITR-2 for better handling',
        impact: 'May affect tax computation'
      });
    }
    
    if (sourceType === 'business' && data.turnover < 2000000) {
      edgeCases.push({
        type: 'presumptive_taxation',
        message: 'Eligible for presumptive taxation',
        action: 'Consider ITR-4 for simpler filing',
        impact: 'May reduce compliance burden'
      });
    }
    
    return edgeCases;
  }
}

// Financial Profile Data Structure
class FinancialProfileData {
  constructor() {
    this.profile = {
      income: {
        total: 0,
        sources: {},
        breakdown: {}
      },
      deductions: {
        total: 0,
        breakdown: {},
        utilization: {}
      },
      investments: {
        total: 0,
        categories: {},
        performance: {}
      },
      taxOptimization: {
        currentSavings: 0,
        potentialSavings: 0,
        recommendations: []
      }
    };
  }

  // Generate comprehensive financial profile
  generateProfile(incomeData, deductions, taxData) {
    const profile = {
      income: this.generateIncomeProfile(incomeData),
      deductions: this.generateDeductionProfile(deductions),
      investments: this.generateInvestmentProfile(incomeData),
      taxOptimization: this.generateTaxOptimization(taxData)
    };
    
    return profile;
  }

  // Generate income profile
  generateIncomeProfile(incomeData) {
    const total = incomeData.totalIncome || 0;
    const sources = {};
    const breakdown = {};
    
    Object.entries(incomeData).forEach(([source, data]) => {
      if (data.hasIncome) {
        sources[source] = data.amount || 0;
        breakdown[source] = {
          amount: data.amount || 0,
          percentage: total > 0 ? ((data.amount || 0) / total) * 100 : 0
        };
      }
    });
    
    return {
      total: total,
      sources: sources,
      breakdown: breakdown
    };
  }

  // Generate deduction profile
  generateDeductionProfile(deductions) {
    const total = Object.values(deductions).reduce((sum, amount) => sum + (amount || 0), 0);
    const breakdown = {};
    const utilization = {};
    
    Object.entries(deductions).forEach(([section, amount]) => {
      const limit = this.getDeductionLimit(section);
      breakdown[section] = {
        amount: amount || 0,
        limit: limit,
        percentage: limit > 0 ? ((amount || 0) / limit) * 100 : 0
      };
      utilization[section] = {
        used: amount || 0,
        available: Math.max(0, limit - (amount || 0)),
        utilizationRate: limit > 0 ? ((amount || 0) / limit) * 100 : 0
      };
    });
    
    return {
      total: total,
      breakdown: breakdown,
      utilization: utilization
    };
  }

  // Generate investment profile
  generateInvestmentProfile(incomeData, deductions) {
    // Simplified investment profile based on deductions
    const investments = {
      equity: deductions.section80C * 0.6, // Assume 60% in equity
      debt: deductions.section80C * 0.4, // Assume 40% in debt
      realEstate: 0 // No real estate investment data
    };
    
    const total = Object.values(investments).reduce((sum, amount) => sum + amount, 0);
    
    return {
      total: total,
      categories: investments,
      performance: {
        currentValue: total * 1.1, // Assume 10% return
        gain: total * 0.1,
        return: 10
      }
    };
  }

  // Generate tax optimization
  generateTaxOptimization(taxData) {
    const currentSavings = taxData.savings || 0;
    const potentialSavings = this.calculatePotentialSavings(taxData);
    const recommendations = this.generateRecommendations(taxData);
    
    return {
      currentSavings: currentSavings,
      potentialSavings: potentialSavings,
      recommendations: recommendations
    };
  }

  // Calculate potential savings
  calculatePotentialSavings(taxData) {
    // Simplified calculation
    return (taxData.optimization || []).reduce((sum, opt) => sum + (opt.potentialSavings || 0), 0);
  }

  // Generate recommendations
  generateRecommendations(taxData) {
    const recommendations = [];
    
    if (taxData.optimization) {
      taxData.optimization.forEach(opt => {
        recommendations.push({
          type: opt.type,
          section: opt.section,
          suggestion: `Maximize ${opt.section} to save ₹${opt.potentialSavings.toLocaleString()}`,
          impact: 'high'
        });
      });
    }
    
    return recommendations;
  }

  // Get deduction limit
  getDeductionLimit(section) {
    const limits = {
      section80C: 150000,
      section80D: 25000,
      section80TTA: 10000,
      section80G: Infinity,
      section24: 200000
    };
    
    return limits[section] || 0;
  }
}

// Export all classes
export {
  ITRJSONSchemaGenerator,
  TaxComputationData,
  IncomeSourceData,
  FinancialProfileData
};
