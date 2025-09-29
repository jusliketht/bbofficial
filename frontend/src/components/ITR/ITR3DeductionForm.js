// =====================================================
// ITR-3 DEDUCTION FORM COMPONENT - BUSINESS DEDUCTIONS
// Enterprise-grade business deduction capture with validation
// =====================================================

import React, { useState } from 'react';
import { 
  Shield, 
  DollarSign, 
  TrendingUp,
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Info,
  X,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';

const ITR3DeductionForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeTab, setActiveTab] = useState('section80C');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Deduction tabs for ITR-3
  const deductionTabs = [
    { id: 'section80C', label: 'Section 80C', icon: Shield },
    { id: 'section80D', label: 'Section 80D', icon: DollarSign },
    { id: 'section80G', label: 'Section 80G', icon: TrendingUp },
    { id: 'businessDeductions', label: 'Business Deductions', icon: Calculator }
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
  
  // Get validation results for current field
  const getValidationResults = (field) => {
    return validationResults.filter(result => result.field === field);
  };
  
  // Get AI suggestions for current field
  const getAISuggestions = (field) => {
    return aiSuggestions.filter(suggestion => suggestion.field === field);
  };
  
  // Render input field with validation
  const renderInputField = (section, field, label, type = 'text', placeholder = '', max = null) => {
    const value = filingData.deductions[section]?.[field] || (type === 'number' ? 0 : '');
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    const handleChange = (e) => {
      const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      updateDeductionData(section, field, newValue);
    };
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-burnblack-black">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            max={max}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-burnblack-gold ${
              fieldValidations.some(v => v.severity === 'error') ? 'border-error-300' : 'border-neutral-300'
            }`}
          />
          {fieldSuggestions.length > 0 && (
            <button
              onClick={() => setShowAITooltip(fieldSuggestions[0])}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Lightbulb className="h-4 w-4 text-burnblack-gold" />
            </button>
          )}
        </div>
        {fieldValidations.map((validation, index) => (
          <div key={index} className={`flex items-center space-x-1 text-xs ${
            validation.severity === 'error' ? 'text-error-600' : 'text-warning-600'
          }`}>
            {validation.severity === 'error' ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Info className="h-3 w-3" />
            )}
            <span>{validation.error}</span>
          </div>
        ))}
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
            <p className="text-sm text-neutral-500">Maximum deduction: ₹1,50,000</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80C', 'lifeInsurance', 'Life Insurance Premium', 'number', '0', '150000')}
          {renderInputField('section80C', 'providentFund', 'Provident Fund', 'number', '0', '150000')}
          {renderInputField('section80C', 'publicProvidentFund', 'Public Provident Fund', 'number', '0', '150000')}
          {renderInputField('section80C', 'equityLinkedSavings', 'ELSS (Equity Linked Savings)', 'number', '0', '150000')}
          {renderInputField('section80C', 'nationalSavingsCertificate', 'National Savings Certificate', 'number', '0', '150000')}
          {renderInputField('section80C', 'sukanyaSamriddhi', 'Sukanya Samriddhi Account', 'number', '0', '150000')}
          {renderInputField('section80C', 'fixedDeposit', 'Fixed Deposit (5 years)', 'number', '0', '150000')}
          {renderInputField('section80C', 'tuitionFees', 'Tuition Fees', 'number', '0', '150000')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80C Deduction</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const section80C = filingData.deductions.section80C || {};
                const total = Object.values(section80C).reduce((sum, value) => sum + (value || 0), 0);
                return Math.min(total, 150000).toLocaleString();
              })()}
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
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80D Deductions</h3>
            <p className="text-sm text-neutral-500">Medical insurance and health expenses</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80D', 'selfAndFamily', 'Self & Family (Below 60)', 'number', '0', '25000')}
          {renderInputField('section80D', 'parents', 'Parents (Below 60)', 'number', '0', '25000')}
          {renderInputField('section80D', 'selfAndFamilySenior', 'Self & Family (60+)', 'number', '0', '50000')}
          {renderInputField('section80D', 'parentsSenior', 'Parents (60+)', 'number', '0', '50000')}
          {renderInputField('section80D', 'preventiveHealthCheckup', 'Preventive Health Checkup', 'number', '0', '5000')}
          {renderInputField('section80D', 'medicalExpenses', 'Medical Expenses', 'number', '0', '50000')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80D Deduction</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const section80D = filingData.deductions.section80D || {};
                const total = Object.values(section80D).reduce((sum, value) => sum + (value || 0), 0);
                return total.toLocaleString();
              })()}
            </span>
          </div>
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
            <TrendingUp className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 80G Deductions</h3>
            <p className="text-sm text-neutral-500">Donations to charitable institutions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section80G', 'donations100Percent', 'Donations (100% deduction)', 'number', '0')}
          {renderInputField('section80G', 'donations50Percent', 'Donations (50% deduction)', 'number', '0')}
          {renderInputField('section80G', 'donations25Percent', 'Donations (25% deduction)', 'number', '0')}
          {renderInputField('section80G', 'donations10Percent', 'Donations (10% deduction)', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total 80G Deduction</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const section80G = filingData.deductions.section80G || {};
                const total = Object.values(section80G).reduce((sum, value) => sum + (value || 0), 0);
                return total.toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render business deductions form
  const renderBusinessDeductionsForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Calculator className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Business Deductions</h3>
            <p className="text-sm text-neutral-500">Business-specific deductions and expenses</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('businessDeductions', 'depreciation', 'Depreciation', 'number', '0')}
          {renderInputField('businessDeductions', 'businessRent', 'Business Rent', 'number', '0')}
          {renderInputField('businessDeductions', 'businessElectricity', 'Business Electricity', 'number', '0')}
          {renderInputField('businessDeductions', 'businessTelephone', 'Business Telephone', 'number', '0')}
          {renderInputField('businessDeductions', 'businessInternet', 'Business Internet', 'number', '0')}
          {renderInputField('businessDeductions', 'businessInsurance', 'Business Insurance', 'number', '0')}
          {renderInputField('businessDeductions', 'businessTravel', 'Business Travel', 'number', '0')}
          {renderInputField('businessDeductions', 'businessMeals', 'Business Meals', 'number', '0')}
          {renderInputField('businessDeductions', 'businessStationery', 'Business Stationery', 'number', '0')}
          {renderInputField('businessDeductions', 'businessProfessionalFees', 'Professional Fees', 'number', '0')}
          {renderInputField('businessDeductions', 'businessBankCharges', 'Bank Charges', 'number', '0')}
          {renderInputField('businessDeductions', 'businessOtherExpenses', 'Other Business Expenses', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total Business Deductions</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const businessDeductions = filingData.deductions.businessDeductions || {};
                const total = Object.values(businessDeductions).reduce((sum, value) => sum + (value || 0), 0);
                return total.toLocaleString();
              })()}
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
      case 'section80G':
        return renderSection80GForm();
      case 'businessDeductions':
        return renderBusinessDeductionsForm();
      default:
        return null;
    }
  };
  
  // Calculate total deductions
  const calculateTotalDeductions = () => {
    let total = 0;
    
    // Section 80C (capped at 1,50,000)
    const section80C = filingData.deductions.section80C || {};
    const section80CTotal = Object.values(section80C).reduce((sum, value) => sum + (value || 0), 0);
    total += Math.min(section80CTotal, 150000);
    
    // Section 80D
    const section80D = filingData.deductions.section80D || {};
    const section80DTotal = Object.values(section80D).reduce((sum, value) => sum + (value || 0), 0);
    total += section80DTotal;
    
    // Section 80G
    const section80G = filingData.deductions.section80G || {};
    const section80GTotal = Object.values(section80G).reduce((sum, value) => sum + (value || 0), 0);
    total += section80GTotal;
    
    // Business deductions
    const businessDeductions = filingData.deductions.businessDeductions || {};
    const businessDeductionsTotal = Object.values(businessDeductions).reduce((sum, value) => sum + (value || 0), 0);
    total += businessDeductionsTotal;
    
    return total;
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
            <h2 className="text-xl font-semibold text-burnblack-black">Deductions</h2>
            <p className="text-sm text-neutral-500">
              Claim your eligible deductions to reduce tax liability
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

export default ITR3DeductionForm;
