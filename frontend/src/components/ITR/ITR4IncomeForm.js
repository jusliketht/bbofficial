// =====================================================
// ITR-4 INCOME FORM COMPONENT - PRESUMPTIVE INCOME CAPTURE
// Enterprise-grade presumptive income capture with 44AD, 44ADA, 44AE
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

const ITR4IncomeForm = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [activeTab, setActiveTab] = useState('businessDetails');
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Income source tabs for ITR-4
  const incomeTabs = [
    { id: 'businessDetails', label: 'Business Details', icon: Building },
    { id: 'section44AD', label: 'Section 44AD', icon: BarChart3 },
    { id: 'section44ADA', label: 'Section 44ADA', icon: PieChart },
    { id: 'section44AE', label: 'Section 44AE', icon: TrendingUp },
    { id: 'otherIncome', label: 'Other Income', icon: Briefcase }
  ];
  
  // Update presumptive income data
  const updatePresumptiveIncomeData = (section, field, value) => {
    updateFilingData({
      presumptiveIncome: {
        ...filingData.presumptiveIncome,
        [section]: {
          ...filingData.presumptiveIncome[section],
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
      : (filingData.presumptiveIncome[section]?.[field] || (type === 'number' ? 0 : ''));
    
    const fieldValidations = getValidationResults(field);
    const fieldSuggestions = getAISuggestions(field);
    
    const handleChange = (e) => {
      const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      
      if (section === 'otherIncome') {
        updateOtherIncomeData(field, newValue);
      } else {
        updatePresumptiveIncomeData(section, field, newValue);
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
          <label className="text-sm font-medium text-burnblack-black mb-2 block">Presumptive Section</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="presumptiveSection"
                value="44AD"
                checked={filingData.presumptiveIncome.businessDetails?.presumptiveSection === '44AD'}
                onChange={(e) => updatePresumptiveIncomeData('businessDetails', 'presumptiveSection', e.target.value)}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">44AD (Business)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="presumptiveSection"
                value="44ADA"
                checked={filingData.presumptiveIncome.businessDetails?.presumptiveSection === '44ADA'}
                onChange={(e) => updatePresumptiveIncomeData('businessDetails', 'presumptiveSection', e.target.value)}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">44ADA (Professional)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="presumptiveSection"
                value="44AE"
                checked={filingData.presumptiveIncome.businessDetails?.presumptiveSection === '44AE'}
                onChange={(e) => updatePresumptiveIncomeData('businessDetails', 'presumptiveSection', e.target.value)}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">44AE (Goods Carriage)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render Section 44AD form
  const renderSection44ADForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <BarChart3 className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 44AD - Business Income</h3>
            <p className="text-sm text-neutral-500">Presumptive taxation for business income</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section44AD', 'grossReceipts', 'Gross Receipts', 'number', '0')}
          {renderInputField('section44AD', 'actualIncome', 'Actual Income (if not using presumptive)', 'number', '0')}
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium text-burnblack-black mb-2 block">Presumptive Rate</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="presumptiveRate"
                value="8"
                checked={filingData.presumptiveIncome.section44AD?.presumptiveRate === 8}
                onChange={(e) => updatePresumptiveIncomeData('section44AD', 'presumptiveRate', parseInt(e.target.value))}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">8% (Digital receipts)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="presumptiveRate"
                value="6"
                checked={filingData.presumptiveIncome.section44AD?.presumptiveRate === 6}
                onChange={(e) => updatePresumptiveIncomeData('section44AD', 'presumptiveRate', parseInt(e.target.value))}
                className="text-burnblack-gold focus:ring-burnblack-gold"
              />
              <span className="text-sm text-neutral-600">6% (Non-digital receipts)</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filingData.presumptiveIncome.section44AD?.usePresumptive || false}
              onChange={(e) => updatePresumptiveIncomeData('section44AD', 'usePresumptive', e.target.checked)}
              className="text-burnblack-gold focus:ring-burnblack-gold"
            />
            <span className="text-sm text-neutral-600">Use presumptive taxation</span>
          </label>
        </div>
        
        <div className="mt-4 p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Presumptive Income</span>
            <span className="text-xl font-bold text-burnblack-gold">
              ₹{(() => {
                const grossReceipts = filingData.presumptiveIncome.section44AD?.grossReceipts || 0;
                const rate = filingData.presumptiveIncome.section44AD?.presumptiveRate || 8;
                return (grossReceipts * rate / 100).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render Section 44ADA form
  const renderSection44ADAForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <PieChart className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 44ADA - Professional Income</h3>
            <p className="text-sm text-neutral-500">Presumptive taxation for professional income</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('section44ADA', 'grossReceipts', 'Gross Receipts', 'number', '0')}
          {renderInputField('section44ADA', 'actualIncome', 'Actual Income (if not using presumptive)', 'number', '0')}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filingData.presumptiveIncome.section44ADA?.usePresumptive || false}
              onChange={(e) => updatePresumptiveIncomeData('section44ADA', 'usePresumptive', e.target.checked)}
              className="text-burnblack-gold focus:ring-burnblack-gold"
            />
            <span className="text-sm text-neutral-600">Use presumptive taxation (50% of gross receipts)</span>
          </label>
        </div>
        
        <div className="mt-4 p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Presumptive Income</span>
            <span className="text-xl font-bold text-burnblack-gold">
              ₹{(() => {
                const grossReceipts = filingData.presumptiveIncome.section44ADA?.grossReceipts || 0;
                return (grossReceipts * 0.5).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render Section 44AE form
  const renderSection44AEForm = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <TrendingUp className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-burnblack-black">Section 44AE - Goods Carriage</h3>
            <p className="text-sm text-neutral-500">Presumptive taxation for goods carriage business</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-burnblack-black">Vehicles</h4>
            <button className="flex items-center space-x-2 px-3 py-1 bg-burnblack-gold text-burnblack-black rounded-lg hover:bg-burnblack-gold-dark transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-neutral-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Vehicle Type</label>
                  <select className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burnblack-gold">
                    <option value="">Select vehicle type</option>
                    <option value="heavy">Heavy Vehicle</option>
                    <option value="light">Light Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Number of Vehicles</label>
                  <input type="number" className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burnblack-gold" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Presumptive Income per Vehicle</label>
                  <input type="number" className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burnblack-gold" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filingData.presumptiveIncome.section44AE?.usePresumptive || false}
              onChange={(e) => updatePresumptiveIncomeData('section44AE', 'usePresumptive', e.target.checked)}
              className="text-burnblack-gold focus:ring-burnblack-gold"
            />
            <span className="text-sm text-neutral-600">Use presumptive taxation</span>
          </label>
        </div>
        
        <div className="mt-4 p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-burnblack-black">Presumptive Income</span>
            <span className="text-xl font-bold text-burnblack-gold">
              ₹{(() => {
                const vehicles = filingData.presumptiveIncome.section44AE?.vehicles || [];
                return vehicles.reduce((total, vehicle) => total + (vehicle.presumptiveIncome || 0), 0).toLocaleString();
              })()}
            </span>
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
      case 'section44AD':
        return renderSection44ADForm();
      case 'section44ADA':
        return renderSection44ADAForm();
      case 'section44AE':
        return renderSection44AEForm();
      case 'otherIncome':
        return renderOtherIncomeForm();
      default:
        return null;
    }
  };
  
  // Calculate total income
  const calculateTotalIncome = () => {
    let total = 0;
    
    // Presumptive income
    if (filingData.presumptiveIncome.section44AD?.usePresumptive) {
      const grossReceipts = filingData.presumptiveIncome.section44AD?.grossReceipts || 0;
      const rate = filingData.presumptiveIncome.section44AD?.presumptiveRate || 8;
      total += grossReceipts * rate / 100;
    } else if (filingData.presumptiveIncome.section44AD?.actualIncome) {
      total += filingData.presumptiveIncome.section44AD.actualIncome;
    }
    
    if (filingData.presumptiveIncome.section44ADA?.usePresumptive) {
      const grossReceipts = filingData.presumptiveIncome.section44ADA?.grossReceipts || 0;
      total += grossReceipts * 0.5;
    } else if (filingData.presumptiveIncome.section44ADA?.actualIncome) {
      total += filingData.presumptiveIncome.section44ADA.actualIncome;
    }
    
    if (filingData.presumptiveIncome.section44AE?.usePresumptive) {
      const vehicles = filingData.presumptiveIncome.section44AE?.vehicles || [];
      total += vehicles.reduce((sum, vehicle) => sum + (vehicle.presumptiveIncome || 0), 0);
    } else if (filingData.presumptiveIncome.section44AE?.actualIncome) {
      total += filingData.presumptiveIncome.section44AE.actualIncome;
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
            <h2 className="text-xl font-semibold text-burnblack-black">Presumptive Income Details</h2>
            <p className="text-sm text-neutral-500">
              Enter your presumptive income details for ITR-4
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

export default ITR4IncomeForm;
