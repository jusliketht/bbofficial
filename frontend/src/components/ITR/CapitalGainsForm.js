// =====================================================
// CAPITAL GAINS FORM COMPONENT - ITR-2 CAPITAL GAINS
// Enterprise-grade capital gains capture for ITR-2
// =====================================================

import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Info,
  X,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';

const CapitalGainsForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeAssetType, setActiveAssetType] = useState('equity');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Asset types for capital gains
  const assetTypes = [
    { id: 'equity', label: 'Equity Shares', icon: TrendingUp },
    { id: 'debt', label: 'Debt Securities', icon: DollarSign },
    { id: 'realEstate', label: 'Real Estate', icon: Home },
    { id: 'other', label: 'Other Assets', icon: Briefcase }
  ];
  
  // Update capital gains data
  const updateCapitalGainsData = (assetType, field, value) => {
    updateFilingData({
      income: {
        ...filingData.income,
        capitalGains: {
          ...filingData.income.capitalGains,
          [assetType]: {
            ...filingData.income.capitalGains[assetType],
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
  const renderInputField = (assetType, field, label, type = 'number', placeholder = '0') => {
    const value = filingData.income.capitalGains?.[assetType]?.[field] || (type === 'number' ? 0 : '');
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-burnblack-black">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => updateCapitalGainsData(assetType, field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
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
  
  // Render equity shares form
  const renderEquityForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <TrendingUp className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Equity Shares</h3>
            <p className="text-sm text-neutral-500">Capital gains from equity shares and mutual funds</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('equity', 'stcg', 'Short-term Capital Gains', 'number', '0')}
          {renderInputField('equity', 'ltcg', 'Long-term Capital Gains', 'number', '0')}
          {renderInputField('equity', 'stcl', 'Short-term Capital Loss', 'number', '0')}
          {renderInputField('equity', 'ltcl', 'Long-term Capital Loss', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Net Capital Gains (Equity)</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const equity = filingData.income.capitalGains?.equity || {};
                const stcg = equity.stcg || 0;
                const ltcg = equity.ltcg || 0;
                const stcl = equity.stcl || 0;
                const ltcl = equity.ltcl || 0;
                return (stcg + ltcg - stcl - ltcl).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render debt securities form
  const renderDebtForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <DollarSign className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Debt Securities</h3>
            <p className="text-sm text-neutral-500">Capital gains from debt mutual funds and bonds</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('debt', 'stcg', 'Short-term Capital Gains', 'number', '0')}
          {renderInputField('debt', 'ltcg', 'Long-term Capital Gains', 'number', '0')}
          {renderInputField('debt', 'stcl', 'Short-term Capital Loss', 'number', '0')}
          {renderInputField('debt', 'ltcl', 'Long-term Capital Loss', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Net Capital Gains (Debt)</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const debt = filingData.income.capitalGains?.debt || {};
                const stcg = debt.stcg || 0;
                const ltcg = debt.ltcg || 0;
                const stcl = debt.stcl || 0;
                const ltcl = debt.ltcl || 0;
                return (stcg + ltcg - stcl - ltcl).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render real estate form
  const renderRealEstateForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Home className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Real Estate</h3>
            <p className="text-sm text-neutral-500">Capital gains from sale of property</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('realEstate', 'salePrice', 'Sale Price', 'number', '0')}
          {renderInputField('realEstate', 'purchasePrice', 'Purchase Price', 'number', '0')}
          {renderInputField('realEstate', 'improvementCost', 'Improvement Cost', 'number', '0')}
          {renderInputField('realEstate', 'indexedCost', 'Indexed Cost', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Net Capital Gains (Real Estate)</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const realEstate = filingData.income.capitalGains?.realEstate || {};
                const salePrice = realEstate.salePrice || 0;
                const indexedCost = realEstate.indexedCost || 0;
                return (salePrice - indexedCost).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render other assets form
  const renderOtherAssetsForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Briefcase className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Other Assets</h3>
            <p className="text-sm text-neutral-500">Capital gains from other assets</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('other', 'stcg', 'Short-term Capital Gains', 'number', '0')}
          {renderInputField('other', 'ltcg', 'Long-term Capital Gains', 'number', '0')}
          {renderInputField('other', 'stcl', 'Short-term Capital Loss', 'number', '0')}
          {renderInputField('other', 'ltcl', 'Long-term Capital Loss', 'number', '0')}
        </div>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Net Capital Gains (Other)</span>
            <span className="text-sm font-semibold text-burnblack-black">
              ₹{(() => {
                const other = filingData.income.capitalGains?.other || {};
                const stcg = other.stcg || 0;
                const ltcg = other.ltcg || 0;
                const stcl = other.stcl || 0;
                const ltcl = other.ltcl || 0;
                return (stcg + ltcg - stcl - ltcl).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current asset type content
  const renderAssetTypeContent = () => {
    switch (activeAssetType) {
      case 'equity':
        return renderEquityForm();
      case 'debt':
        return renderDebtForm();
      case 'realEstate':
        return renderRealEstateForm();
      case 'other':
        return renderOtherAssetsForm();
      default:
        return null;
    }
  };
  
  // Calculate total capital gains
  const calculateTotalCapitalGains = () => {
    let total = 0;
    
    Object.values(filingData.income.capitalGains || {}).forEach(asset => {
      if (asset) {
        const stcg = asset.stcg || 0;
        const ltcg = asset.ltcg || 0;
        const stcl = asset.stcl || 0;
        const ltcl = asset.ltcl || 0;
        
        if (asset.salePrice && asset.indexedCost) {
          // Real estate calculation
          total += (asset.salePrice - asset.indexedCost);
        } else {
          // Other assets calculation
          total += (stcg + ltcg - stcl - ltcl);
        }
      }
    });
    
    return Math.max(0, total);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <TrendingUp className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Capital Gains</h2>
            <p className="text-sm text-neutral-500">
              Enter capital gains from sale of assets
            </p>
          </div>
        </div>
        
        {/* Total Capital Gains Summary */}
        <div className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Total Capital Gains</span>
            <span className="text-2xl font-bold text-burnblack-gold">
              ₹{calculateTotalCapitalGains().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Asset Type Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {assetTypes.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setActiveAssetType(asset.id)}
            className={`flex-shrink-0 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeAssetType === asset.id
                ? 'bg-burnblack-white text-burnblack-gold shadow-sm'
                : 'text-neutral-600 hover:text-burnblack-gold'
            }`}
          >
            <asset.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{asset.label}</span>
          </button>
        ))}
      </div>
      
      {/* Asset Type Content */}
      {renderAssetTypeContent()}
      
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

export default CapitalGainsForm;
