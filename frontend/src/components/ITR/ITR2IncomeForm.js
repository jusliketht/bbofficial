// =====================================================
// ITR-2 INCOME FORM COMPONENT - ADVANCED INCOME CAPTURE
// Enterprise-grade ITR-2 income capture with capital gains and foreign income
// =====================================================

import React, { useState } from 'react';
import { 
  DollarSign, 
  Home, 
  Building, 
  Briefcase, 
  TrendingUp,
  Globe,
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Calculator, 
  Lightbulb,
  Info,
  X,
  Plus,
  Trash2
} from 'lucide-react';

// Import ITR-2 specific components
import CapitalGainsForm from './CapitalGainsForm';
import ForeignIncomeForm from './ForeignIncomeForm';

const ITR2IncomeForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeTab, setActiveTab] = useState('salary');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Income source tabs for ITR-2
  const incomeTabs = [
    { id: 'salary', label: 'Salary Income', icon: DollarSign },
    { id: 'houseProperty', label: 'House Property', icon: Home },
    { id: 'capitalGains', label: 'Capital Gains', icon: TrendingUp },
    { id: 'foreignIncome', label: 'Foreign Income', icon: Globe },
    { id: 'otherIncome', label: 'Other Income', icon: Briefcase },
    { id: 'exemptIncome', label: 'Exempt Income', icon: Building }
  ];
  
  // Update income data
  const updateIncomeData = (section, field, value) => {
    updateFilingData({
      income: {
        ...filingData.income,
        [section]: {
          ...filingData.income[section],
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
  const renderInputField = (section, field, label, type = 'number', placeholder = '0') => {
    const value = filingData.income[section]?.[field] || (type === 'number' ? 0 : '');
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-burnblack-black">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => updateIncomeData(section, field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
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
  
  // Render salary income form
  const renderSalaryForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Salary Income</h3>
            <p className="text-sm text-neutral-500">Enter your salary details from Form-16</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('salary', 'basicSalary', 'Basic Salary', 'number', 'Enter basic salary')}
          {renderInputField('salary', 'hra', 'HRA Received', 'number', 'House rent allowance')}
          {renderInputField('salary', 'allowances', 'Other Allowances', 'number', 'DA, medical, etc.')}
          {renderInputField('salary', 'tdsDeducted', 'TDS Deducted', 'number', 'Tax deducted at source')}
        </div>
      </div>
    </div>
  );
  
  // Render house property form
  const renderHousePropertyForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Home className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">House Property Income</h3>
            <p className="text-sm text-neutral-500">Income from house property (multiple properties allowed)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('houseProperty', 'annualValue', 'Annual Value', 'number', 'Rent received')}
          {renderInputField('houseProperty', 'municipalTaxes', 'Municipal Taxes', 'number', 'Property taxes paid')}
          {renderInputField('houseProperty', 'interestOnLoan', 'Interest on Home Loan', 'number', 'Interest paid')}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filingData.income.houseProperty?.isSelfOccupied || false}
              onChange={(e) => updateIncomeData('houseProperty', 'isSelfOccupied', e.target.checked)}
              className="rounded border-neutral-300 text-burnblack-gold focus:ring-burnblack-gold"
            />
            <span className="text-sm text-neutral-600">Self-occupied property</span>
          </label>
        </div>
      </div>
    </div>
  );
  
  // Render other income form
  const renderOtherIncomeForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Briefcase className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Other Income</h3>
            <p className="text-sm text-neutral-500">Interest, dividends, and other sources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('otherIncome', 'bankInterest', 'Bank Interest', 'number', 'Interest from savings')}
          {renderInputField('otherIncome', 'fdInterest', 'FD Interest', 'number', 'Fixed deposit interest')}
          {renderInputField('otherIncome', 'dividendIncome', 'Dividend Income', 'number', 'Dividends received')}
          {renderInputField('otherIncome', 'otherSources', 'Other Sources', 'number', 'Any other income')}
        </div>
      </div>
    </div>
  );
  
  // Render exempt income form
  const renderExemptIncomeForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Building className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Exempt Income</h3>
            <p className="text-sm text-neutral-500">Income exempt from tax</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('exemptIncome', 'agricultureIncome', 'Agriculture Income', 'number', 'Income from agriculture')}
          {renderInputField('exemptIncome', 'ltcgExempt', 'LTCG Exempt', 'number', 'Exempt long-term capital gains')}
          {renderInputField('exemptIncome', 'otherExempt', 'Other Exempt Income', 'number', 'Other exempt sources')}
        </div>
      </div>
    </div>
  );
  
  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'salary':
        return renderSalaryForm();
      case 'houseProperty':
        return renderHousePropertyForm();
      case 'capitalGains':
        return (
          <CapitalGainsForm
            filingData={filingData}
            updateFilingData={updateFilingData}
            validationResults={getValidationResults('capitalGains')}
            aiSuggestions={getAISuggestions('capitalGains')}
            onValidate={onValidate}
            isValidating={isValidating}
          />
        );
      case 'foreignIncome':
        return (
          <ForeignIncomeForm
            filingData={filingData}
            updateFilingData={updateFilingData}
            validationResults={getValidationResults('foreignIncome')}
            aiSuggestions={getAISuggestions('foreignIncome')}
            onValidate={onValidate}
            isValidating={isValidating}
          />
        );
      case 'otherIncome':
        return renderOtherIncomeForm();
      case 'exemptIncome':
        return renderExemptIncomeForm();
      default:
        return null;
    }
  };
  
  // Calculate total income
  const calculateTotalIncome = () => {
    let total = 0;
    
    // Salary income
    if (filingData.income.salary) {
      const { basicSalary = 0, hra = 0, allowances = 0 } = filingData.income.salary;
      total += basicSalary + hra + allowances;
    }
    
    // House property income
    if (filingData.income.houseProperty) {
      const { annualValue = 0, municipalTaxes = 0, interestOnLoan = 0, isSelfOccupied = false } = filingData.income.houseProperty;
      const netAnnualValue = annualValue - municipalTaxes;
      
      if (isSelfOccupied) {
        total += Math.max(-200000, -interestOnLoan);
      } else {
        total += netAnnualValue - interestOnLoan;
      }
    }
    
    // Capital gains
    if (filingData.income.capitalGains) {
      const { stcg = 0, ltcg = 0 } = filingData.income.capitalGains;
      total += stcg + ltcg;
    }
    
    // Foreign income
    if (filingData.income.foreignIncome) {
      const { salary = 0, business = 0, other = 0 } = filingData.income.foreignIncome;
      total += salary + business + other;
    }
    
    // Other income
    if (filingData.income.otherIncome) {
      const { bankInterest = 0, fdInterest = 0, dividendIncome = 0, otherSources = 0 } = filingData.income.otherIncome;
      total += bankInterest + fdInterest + dividendIncome + otherSources;
    }
    
    return Math.max(0, total);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Income Details (ITR-2)</h2>
            <p className="text-sm text-neutral-500">
              Enter your income from all sources including capital gains and foreign income
            </p>
          </div>
        </div>
        
        {/* Total Income Summary */}
        <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Total Income</span>
            <span className="text-2xl font-bold text-burnblack-gold">
              ₹{calculateTotalIncome().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Income Source Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {incomeTabs.map((tab) => (
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

export default ITR2IncomeForm;
