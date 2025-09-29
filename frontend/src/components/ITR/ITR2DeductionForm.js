// =====================================================
// ITR-2 DEDUCTION FORM COMPONENT - ADVANCED DEDUCTIONS
// Enterprise-grade ITR-2 deduction capture with multiple sections
// =====================================================

import React, { useState } from 'react';
import { 
  Shield, 
  DollarSign, 
  Home, 
  Heart, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Calculator,
  TrendingUp,
  Info,
  X,
  Plus,
  Trash2
} from 'lucide-react';

const ITR2DeductionForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeTab, setActiveTab] = useState('section80C');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Deduction tabs for ITR-2
  const deductionTabs = [
    { id: 'section80C', label: 'Section 80C', icon: Shield },
    { id: 'section80D', label: 'Section 80D', icon: Heart },
    { id: 'hra', label: 'HRA', icon: Home },
    { id: 'section80G', label: 'Section 80G', icon: GraduationCap },
    { id: 'section80E', label: 'Section 80E', icon: DollarSign },
    { id: 'section80TTA', label: 'Section 80TTA', icon: TrendingUp }
  ];
  
  // Update deduction data
  const updateDeductionData = (section, field, value) => {
    updateFilingData({
      deductions: {
        ...filingData.deductions,
        [section]: {
          ...filingData.deductions[section],
          [field]: value
        }
      }
    });
  };
  
  // Calculate section totals
  const calculateSectionTotal = (section) => {
    const sectionData = filingData.deductions[section];
    if (!sectionData) return 0;
    
    switch (section) {
      case 'section80C':
        return (sectionData.licPremium || 0) + 
               (sectionData.ppfContribution || 0) + 
               (sectionData.pfContribution || 0) + 
               (sectionData.elssInvestment || 0) + 
               (sectionData.tuitionFees || 0) + 
               (sectionData.homeLoanPrincipal || 0);
      
      case 'section80D':
        return (sectionData.medicalInsurance || 0) + 
               (sectionData.preventiveHealth || 0);
      
      case 'section80G':
        return sectionData.donations || 0;
      
      case 'section80E':
        return sectionData.educationLoanInterest || 0;
      
      case 'section80TTA':
        return sectionData.savingsInterest || 0;
      
      default:
        return 0;
    }
  };
  
  // Get validation results for current field
  const getFieldValidation = (field) => {
    return validationResults.find(result => result.field === field);
  };
  
  // Get AI suggestions for current field
  const getFieldAISuggestion = (field) => {
    return aiSuggestions.find(suggestion => suggestion.field === field);
  };
  
  // Render input field with validation
  const renderInputField = (section, field, label, type = 'number', placeholder = '0') => {
    const value = filingData.deductions[section]?.[field] || 0;
    const fieldValidation = getFieldValidation(field);
    const aiSuggestion = getFieldAISuggestion(field);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-burnblack-black">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => updateDeductionData(section, field, parseFloat(e.target.value) || 0)}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-burnblack-gold ${
              fieldValidation?.severity === 'error' ? 'border-error-300' : 'border-neutral-300'
            }`}
          />
          {aiSuggestion && (
            <button
              onClick={() => setShowAITooltip(aiSuggestion)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Lightbulb className="h-4 w-4 text-burnblack-gold" />
            </button>
          )}
        </div>
        {fieldValidation && (
          <div className={`flex items-center space-x-1 text-xs ${
            fieldValidation.severity === 'error' ? 'text-error-600' : 'text-warning-600'
          }`}>
            {fieldValidation.severity === 'error' ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Info className="h-3 w-3" />
            )}
            <span>{fieldValidation.error}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render Section 80C form
  const renderSection80CForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Shield className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80C Deductions</h3>
            <p className="text-sm text-neutral-500">Maximum limit: ₹1,50,000</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80C', 'licPremium', 'LIC Premium', 'number', '0')}
          {renderInputField('section80C', 'ppfContribution', 'PPF Contribution', 'number', '0')}
          {renderInputField('section80C', 'pfContribution', 'PF Contribution', 'number', '0')}
          {renderInputField('section80C', 'elssInvestment', 'ELSS Investment', 'number', '0')}
          {renderInputField('section80C', 'tuitionFees', 'Tuition Fees', 'number', '0')}
          {renderInputField('section80C', 'homeLoanPrincipal', 'Home Loan Principal', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80C</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{calculateSectionTotal('section80C').toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">Remaining limit</span>
            <span className="text-xs text-neutral-500">
              ₹{Math.max(0, 150000 - calculateSectionTotal('section80C')).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render Section 80D form
  const renderSection80DForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Heart className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80D Deductions</h3>
            <p className="text-sm text-neutral-500">Medical insurance and preventive health</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80D', 'medicalInsurance', 'Medical Insurance', 'number', '0')}
          {renderInputField('section80D', 'preventiveHealth', 'Preventive Health Checkup', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80D</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{calculateSectionTotal('section80D').toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render HRA form
  const renderHRAForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Home className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">HRA Exemption</h3>
            <p className="text-sm text-neutral-500">House Rent Allowance calculation</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('hra', 'hraReceived', 'HRA Received', 'number', '0')}
          {renderInputField('hra', 'rentPaid', 'Rent Paid', 'number', '0')}
          {renderInputField('hra', 'landlordPAN', 'Landlord PAN', 'text', '')}
          {renderInputField('hra', 'landlordName', 'Landlord Name', 'text', '')}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filingData.deductions.hra?.isMetroCity || false}
              onChange={(e) => updateDeductionData('hra', 'isMetroCity', e.target.checked)}
              className="rounded border-neutral-300 text-burnblack-gold focus:ring-burnblack-gold"
            />
            <span className="text-sm text-neutral-600">Metro city (50% of salary vs 40%)</span>
          </label>
        </div>
      </div>
    </div>
  );
  
  // Render Section 80G form
  const renderSection80GForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <GraduationCap className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80G Deductions</h3>
            <p className="text-sm text-neutral-500">Donations to charitable institutions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80G', 'donations', 'Donations', 'number', '0')}
        </div>
      </div>
    </div>
  );
  
  // Render Section 80E form
  const renderSection80EForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80E Deductions</h3>
            <p className="text-sm text-neutral-500">Interest on education loan</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80E', 'educationLoanInterest', 'Education Loan Interest', 'number', '0')}
        </div>
      </div>
    </div>
  );
  
  // Render Section 80TTA form
  const renderSection80TTAForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <TrendingUp className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80TTA Deductions</h3>
            <p className="text-sm text-neutral-500">Interest on savings account (₹10,000 limit)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80TTA', 'savingsInterest', 'Savings Account Interest', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80TTA</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{Math.min(10000, calculateSectionTotal('section80TTA')).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'section80C':
        return renderSection80CForm();
      case 'section80D':
        return renderSection80DForm();
      case 'hra':
        return renderHRAForm();
      case 'section80G':
        return renderSection80GForm();
      case 'section80E':
        return renderSection80EForm();
      case 'section80TTA':
        return renderSection80TTAForm();
      default:
        return null;
    }
  };
  
  // Calculate total deductions
  const calculateTotalDeductions = () => {
    return deductionTabs.reduce((total, tab) => {
      const sectionTotal = calculateSectionTotal(tab.id);
      
      // Apply limits
      switch (tab.id) {
        case 'section80C':
          return total + Math.min(150000, sectionTotal);
        case 'section80D':
          return total + Math.min(25000, sectionTotal);
        case 'section80TTA':
          return total + Math.min(10000, sectionTotal);
        default:
          return total + sectionTotal;
      }
    }, 0);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Shield className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Deductions (ITR-2)</h2>
            <p className="text-sm text-neutral-500">
              Claim applicable deductions to reduce your taxable income
            </p>
          </div>
        </div>
        
        {/* Total Deductions Summary */}
        <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Total Deductions</span>
            <span className="text-2xl font-bold text-burnblack-gold">
              ₹{calculateTotalDeductions().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Deduction Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {deductionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-burnblack-white text-burnblack-gold shadow-sm'
                : 'text-neutral-600 hover:text-burnblack-gold'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* AI Tooltip */}
      {showAITooltip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-burnblack-gold mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-burnblack-black mb-2">AI Suggestion</h3>
                <p className="text-sm text-neutral-600 mb-3">{showAITooltip.message}</p>
                {showAITooltip.suggestion && (
                  <p className="text-xs text-neutral-500">{showAITooltip.suggestion}</p>
                )}
              </div>
              <button
                onClick={() => setShowAITooltip(null)}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAITooltip(null)}
                className="px-4 py-2 bg-burnblack-gold text-white rounded-lg hover:bg-burnblack-gold-dark transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITR2DeductionForm;
