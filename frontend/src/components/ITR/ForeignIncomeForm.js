// =====================================================
// FOREIGN INCOME FORM COMPONENT - ITR-2 FOREIGN INCOME
// Enterprise-grade foreign income capture for ITR-2
// =====================================================

import React, { useState } from 'react';
import { 
  Globe, 
  DollarSign, 
  Briefcase, 
  Building, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Info,
  X,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';

const ForeignIncomeForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeIncomeType, setActiveIncomeType] = useState('salary');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Foreign income types
  const incomeTypes = [
    { id: 'salary', label: 'Foreign Salary', icon: DollarSign },
    { id: 'business', label: 'Foreign Business', icon: Briefcase },
    { id: 'other', label: 'Other Foreign Income', icon: Building }
  ];
  
  // Update foreign income data
  const updateForeignIncomeData = (incomeType, field, value) => {
    updateFilingData({
      income: {
        ...filingData.income,
        foreignIncome: {
          ...filingData.income.foreignIncome,
          [incomeType]: {
            ...filingData.income.foreignIncome[incomeType],
            [field]: value
          }
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
  const renderInputField = (incomeType, field, label, type = 'number', placeholder = '0') => {
    const value = filingData.income.foreignIncome?.[incomeType]?.[field] || (type === 'number' ? 0 : '');
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-burnblack-black">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => updateForeignIncomeData(incomeType, field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            placeholder={placeholder}
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
  
  // Render foreign salary form
  const renderForeignSalaryForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Foreign Salary</h3>
            <p className="text-sm text-neutral-500">Salary income from foreign employment</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('salary', 'grossSalary', 'Gross Salary (Foreign Currency)', 'number', '0')}
          {renderInputField('salary', 'exchangeRate', 'Exchange Rate', 'number', '1.00')}
          {renderInputField('salary', 'taxPaid', 'Tax Paid Abroad', 'number', '0')}
          {renderInputField('salary', 'country', 'Country', 'text', 'Enter country name')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Salary in INR</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const salary = filingData.income.foreignIncome?.salary || {};
                const grossSalary = salary.grossSalary || 0;
                const exchangeRate = salary.exchangeRate || 1;
                return (grossSalary * exchangeRate).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render foreign business form
  const renderForeignBusinessForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Briefcase className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Foreign Business</h3>
            <p className="text-sm text-neutral-500">Business income from foreign operations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('business', 'grossReceipts', 'Gross Receipts', 'number', '0')}
          {renderInputField('business', 'expenses', 'Business Expenses', 'number', '0')}
          {renderInputField('business', 'taxPaid', 'Tax Paid Abroad', 'number', '0')}
          {renderInputField('business', 'country', 'Country', 'text', 'Enter country name')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Net Business Income</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const business = filingData.income.foreignIncome?.business || {};
                const grossReceipts = business.grossReceipts || 0;
                const expenses = business.expenses || 0;
                return (grossReceipts - expenses).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render other foreign income form
  const renderOtherForeignIncomeForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Building className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Other Foreign Income</h3>
            <p className="text-sm text-neutral-500">Other sources of foreign income</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('other', 'interest', 'Interest Income', 'number', '0')}
          {renderInputField('other', 'dividend', 'Dividend Income', 'number', '0')}
          {renderInputField('other', 'royalty', 'Royalty Income', 'number', '0')}
          {renderInputField('other', 'other', 'Other Income', 'number', '0')}
          {renderInputField('other', 'taxPaid', 'Tax Paid Abroad', 'number', '0')}
          {renderInputField('other', 'country', 'Country', 'text', 'Enter country name')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total Other Income</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const other = filingData.income.foreignIncome?.other || {};
                const interest = other.interest || 0;
                const dividend = other.dividend || 0;
                const royalty = other.royalty || 0;
                const otherIncome = other.other || 0;
                return (interest + dividend + royalty + otherIncome).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current income type content
  const renderIncomeTypeContent = () => {
    switch (activeIncomeType) {
      case 'salary':
        return renderForeignSalaryForm();
      case 'business':
        return renderForeignBusinessForm();
      case 'other':
        return renderOtherForeignIncomeForm();
      default:
        return null;
    }
  };
  
  // Calculate total foreign income
  const calculateTotalForeignIncome = () => {
    let total = 0;
    
    // Foreign salary
    if (filingData.income.foreignIncome?.salary) {
      const { grossSalary = 0, exchangeRate = 1 } = filingData.income.foreignIncome.salary;
      total += grossSalary * exchangeRate;
    }
    
    // Foreign business
    if (filingData.income.foreignIncome?.business) {
      const { grossReceipts = 0, expenses = 0 } = filingData.income.foreignIncome.business;
      total += grossReceipts - expenses;
    }
    
    // Other foreign income
    if (filingData.income.foreignIncome?.other) {
      const { interest = 0, dividend = 0, royalty = 0, other = 0 } = filingData.income.foreignIncome.other;
      total += interest + dividend + royalty + other;
    }
    
    return Math.max(0, total);
  };
  
  // Calculate total foreign tax paid
  const calculateTotalForeignTaxPaid = () => {
    let total = 0;
    
    Object.values(filingData.income.foreignIncome || {}).forEach(income => {
      if (income && income.taxPaid) {
        total += income.taxPaid;
      }
    });
    
    return total;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Globe className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Foreign Income</h2>
            <p className="text-sm text-neutral-500">
              Enter income from foreign sources with tax credit
            </p>
          </div>
        </div>
        
        {/* Foreign Income Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-burnblack-black">Total Foreign Income</span>
              <span className="text-lg font-bold text-burnblack-gold">
                ₹{calculateTotalForeignIncome().toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-burnblack-black">Foreign Tax Paid</span>
              <span className="text-lg font-bold text-burnblack-gold">
                ₹{calculateTotalForeignTaxPaid().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Income Type Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {incomeTypes.map((income) => (
          <button
            key={income.id}
            onClick={() => setActiveIncomeType(income.id)}
            className={`flex-shrink-0 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeIncomeType === income.id
                ? 'bg-burnblack-white text-burnblack-gold shadow-sm'
                : 'text-neutral-600 hover:text-burnblack-gold'
            }`}
          >
            <income.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{income.label}</span>
          </button>
        ))}
      </div>
      
      {/* Income Type Content */}
      {renderIncomeTypeContent()}
      
      {/* Tax Credit Information */}
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Foreign Tax Credit</h3>
        <div className="space-y-3">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">
              Foreign tax credit is available to avoid double taxation on foreign income.
            </p>
          </div>
          
          <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-burnblack-black">Available Tax Credit</span>
              <span className="text-sm font-semibold text-burnblack-gold">
                ₹{calculateTotalForeignTaxPaid().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
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

export default ForeignIncomeForm;
