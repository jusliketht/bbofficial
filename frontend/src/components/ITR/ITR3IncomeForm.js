// =====================================================
// ITR-3 INCOME FORM COMPONENT - BUSINESS INCOME CAPTURE
// Enterprise-grade business income capture with P&L and Balance Sheet
// =====================================================

import React, { useState } from 'react';
import { 
  DollarSign, 
  Building, 
  Briefcase, 
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Info,
  X,
  Plus,
  Trash2,
  Calculator,
  FileText,
  Upload
} from 'lucide-react';

const ITR3IncomeForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeTab, setActiveTab] = useState('businessDetails');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Income source tabs for ITR-3
  const incomeTabs = [
    { id: 'businessDetails', label: 'Business Details', icon: Building },
    { id: 'profitLoss', label: 'P&L Statement', icon: BarChart3 },
    { id: 'balanceSheet', label: 'Balance Sheet', icon: PieChart },
    { id: 'otherIncome', label: 'Other Income', icon: Briefcase }
  ];
  
  // Update business income data
  const updateBusinessIncomeData = (section, field, value) => {
    updateFilingData({
      businessIncome: {
        ...filingData.businessIncome,
        [section]: {
          ...filingData.businessIncome[section],
          [field]: value
        }
      }
    });
  };
  
  // Update other income data
  const updateOtherIncomeData = (field, value) => {
    updateFilingData({
      otherIncome: {
        ...filingData.otherIncome,
        [field]: value
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
  const renderInputField = (section, field, label, type = 'text', placeholder = '') => {
    const value = section === 'otherIncome' 
      ? (filingData.otherIncome?.[field] || (type === 'number' ? 0 : ''))
      : (filingData.businessIncome[section]?.[field] || (type === 'number' ? 0 : ''));
    
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    const handleChange = (e) => {
      const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      
      if (section === 'otherIncome') {
        updateOtherIncomeData(field, newValue);
      } else {
        updateBusinessIncomeData(section, field, newValue);
      }
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
  
  // Render business details form
  const renderBusinessDetailsForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Building className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Business Details</h3>
            <p className="text-sm text-neutral-500">Enter your business information</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('businessDetails', 'businessName', 'Business Name', 'text', 'Enter business name')}
          {renderInputField('businessDetails', 'businessType', 'Business Type', 'text', 'e.g., Trading, Manufacturing')}
          {renderInputField('businessDetails', 'businessAddress', 'Business Address', 'text', 'Enter business address')}
          {renderInputField('businessDetails', 'gstNumber', 'GST Number', 'text', 'Enter GST number')}
          {renderInputField('businessDetails', 'panNumber', 'PAN Number', 'text', 'Enter PAN number')}
          {renderInputField('businessDetails', 'businessCommencementDate', 'Commencement Date', 'date', '')}
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium text-burnblack-black mb-2 block">Accounting Method</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="accountingMethod"
                value="mercantile"
                checked={filingData.businessIncome.businessDetails?.accountingMethod === 'mercantile'}
                onChange={(e) => updateBusinessIncomeData('businessDetails', 'accountingMethod', e.target.value)}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">Mercantile</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="accountingMethod"
                value="cash"
                checked={filingData.businessIncome.businessDetails?.accountingMethod === 'cash'}
                onChange={(e) => updateBusinessIncomeData('businessDetails', 'accountingMethod', e.target.value)}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">Cash</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render P&L statement form
  const renderProfitLossForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <BarChart3 className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Profit & Loss Statement</h3>
            <p className="text-sm text-neutral-500">Enter your business income and expenses</p>
          </div>
        </div>
        
        {/* Income Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-burnblack-black mb-4">Income</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('profitLoss', 'revenue', 'Sales/Revenue', 'number', '0')}
            {renderInputField('profitLoss', 'otherIncome', 'Other Income', 'number', '0')}
          </div>
          
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Income</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(() => {
                  const revenue = filingData.businessIncome.profitLoss?.revenue || 0;
                  const otherIncome = filingData.businessIncome.profitLoss?.otherIncome || 0;
                  return (revenue + otherIncome).toLocaleString();
                })()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Expenses Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-burnblack-black mb-4">Expenses</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('profitLoss', 'purchases', 'Purchases', 'number', '0')}
            {renderInputField('profitLoss', 'directExpenses', 'Direct Expenses', 'number', '0')}
            {renderInputField('profitLoss', 'indirectExpenses', 'Indirect Expenses', 'number', '0')}
          </div>
          
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Expenses</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(() => {
                  const purchases = filingData.businessIncome.profitLoss?.purchases || 0;
                  const directExpenses = filingData.businessIncome.profitLoss?.directExpenses || 0;
                  const indirectExpenses = filingData.businessIncome.profitLoss?.indirectExpenses || 0;
                  return (purchases + directExpenses + indirectExpenses).toLocaleString();
                })()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Net Profit/Loss */}
        <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Net Profit/Loss</span>
            <span className="text-xl font-bold text-burnblack-gold">
              ₹{(() => {
                const revenue = filingData.businessIncome.profitLoss?.revenue || 0;
                const otherIncome = filingData.businessIncome.profitLoss?.otherIncome || 0;
                const purchases = filingData.businessIncome.profitLoss?.purchases || 0;
                const directExpenses = filingData.businessIncome.profitLoss?.directExpenses || 0;
                const indirectExpenses = filingData.businessIncome.profitLoss?.indirectExpenses || 0;
                const totalIncome = revenue + otherIncome;
                const totalExpenses = purchases + directExpenses + indirectExpenses;
                return (totalIncome - totalExpenses).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render balance sheet form
  const renderBalanceSheetForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <PieChart className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Balance Sheet</h3>
            <p className="text-sm text-neutral-500">Enter your business assets and liabilities</p>
          </div>
        </div>
        
        {/* Assets Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-burnblack-black mb-4">Assets</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('balanceSheet', 'currentAssets', 'Current Assets', 'number', '0')}
            {renderInputField('balanceSheet', 'fixedAssets', 'Fixed Assets', 'number', '0')}
            {renderInputField('balanceSheet', 'investments', 'Investments', 'number', '0')}
          </div>
          
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Assets</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(() => {
                  const currentAssets = filingData.businessIncome.balanceSheet?.currentAssets || 0;
                  const fixedAssets = filingData.businessIncome.balanceSheet?.fixedAssets || 0;
                  const investments = filingData.businessIncome.balanceSheet?.investments || 0;
                  return (currentAssets + fixedAssets + investments).toLocaleString();
                })()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Liabilities Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-burnblack-black mb-4">Liabilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('balanceSheet', 'currentLiabilities', 'Current Liabilities', 'number', '0')}
            {renderInputField('balanceSheet', 'longTermLiabilities', 'Long-term Liabilities', 'number', '0')}
          </div>
          
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Liabilities</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(() => {
                  const currentLiabilities = filingData.businessIncome.balanceSheet?.currentLiabilities || 0;
                  const longTermLiabilities = filingData.businessIncome.balanceSheet?.longTermLiabilities || 0;
                  return (currentLiabilities + longTermLiabilities).toLocaleString();
                })()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Capital Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-burnblack-black mb-4">Capital</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('balanceSheet', 'openingCapital', 'Opening Capital', 'number', '0')}
            {renderInputField('balanceSheet', 'drawings', 'Drawings', 'number', '0')}
          </div>
          
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-neutral-600">Closing Capital</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(() => {
                  const openingCapital = filingData.businessIncome.balanceSheet?.openingCapital || 0;
                  const netProfit = filingData.businessIncome.profitLoss?.netProfit || 0;
                  const drawings = filingData.businessIncome.balanceSheet?.drawings || 0;
                  return (openingCapital + netProfit - drawings).toLocaleString();
                })()}
              </span>
            </div>
          </div>
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
            <p className="text-sm text-neutral-500">Income from other sources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('otherIncome', 'salary', 'Salary Income', 'number', '0')}
          {renderInputField('otherIncome', 'houseProperty', 'House Property', 'number', '0')}
          {renderInputField('otherIncome', 'capitalGains', 'Capital Gains', 'number', '0')}
          {renderInputField('otherIncome', 'otherSources', 'Other Sources', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Total Other Income</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const salary = filingData.otherIncome?.salary || 0;
                const houseProperty = filingData.otherIncome?.houseProperty || 0;
                const capitalGains = filingData.otherIncome?.capitalGains || 0;
                const otherSources = filingData.otherIncome?.otherSources || 0;
                return (salary + houseProperty + capitalGains + otherSources).toLocaleString();
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
      case 'businessDetails':
        return renderBusinessDetailsForm();
      case 'profitLoss':
        return renderProfitLossForm();
      case 'balanceSheet':
        return renderBalanceSheetForm();
      case 'otherIncome':
        return renderOtherIncomeForm();
      default:
        return null;
    }
  };
  
  // Calculate total income
  const calculateTotalIncome = () => {
    let total = 0;
    
    // Business income
    if (filingData.businessIncome.profitLoss) {
      const { revenue = 0, otherIncome = 0 } = filingData.businessIncome.profitLoss;
      total += revenue + otherIncome;
    }
    
    // Other income
    if (filingData.otherIncome) {
      const { salary = 0, houseProperty = 0, capitalGains = 0, otherSources = 0 } = filingData.otherIncome;
      total += salary + houseProperty + capitalGains + otherSources;
    }
    
    return total;
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
            <h2 className="text-xl font-semibold text-burnblack-black">Business Income Details</h2>
            <p className="text-sm text-neutral-500">
              Enter your business income, P&L statement, and balance sheet
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

export default ITR3IncomeForm;
