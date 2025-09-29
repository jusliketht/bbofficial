import React from 'react';

// ITR Selection Component
export const ITRSelection = ({ onSelect, selectedType }) => {
  const itrTypes = [
    { id: 'ITR-1', name: 'ITR-1 (Sahaj)', description: 'For individuals with salary, pension, or interest income' },
    { id: 'ITR-2', name: 'ITR-2', description: 'For individuals with income from capital gains' },
    { id: 'ITR-3', name: 'ITR-3', description: 'For individuals with business income' },
    { id: 'ITR-4', name: 'ITR-4 (Sugam)', description: 'For individuals with presumptive business income' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select ITR Form Type</h3>
      {itrTypes.map((type) => (
        <div
          key={type.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelect(type.id)}
        >
          <h4 className="font-medium">{type.name}</h4>
          <p className="text-sm text-gray-600">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

// Dynamic Form Field Component
export const DynamicFormField = ({ field, value, onChange, error }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={field.placeholder}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{field.label}</label>
      {renderField()}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Income Source Card Component
export const IncomeSourceCard = ({ source, onEdit, onDelete }) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{source.name}</h4>
          <p className="text-sm text-gray-600">Amount: ₹{source.amount?.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(source)} className="text-blue-600 hover:text-blue-800">
            Edit
          </button>
          <button onClick={() => onDelete(source.id)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Tax Summary Card Component
export const TaxSummaryCard = ({ summary }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium mb-3">Tax Summary</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Total Income:</span>
          <span>₹{summary.totalIncome?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Deductions:</span>
          <span>₹{summary.totalDeductions?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Tax Liability:</span>
          <span>₹{summary.taxLiability?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Mobile Summary Dashboard Component
export const MobileSummaryDashboard = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-medium mb-3">Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Income:</span>
          <span>₹{data.income?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Deductions:</span>
          <span>₹{data.deductions?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Tax:</span>
          <span>₹{data.tax?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Step Indicator Component
export const StepIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          <span className="ml-2 text-sm">{step}</span>
          {index < totalSteps - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
        </div>
      ))}
    </div>
  );
};

// Smart Prompt Component
export const SmartPrompt = ({ message, onAction }) => {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Learn More
        </button>
      )}
    </div>
  );
};

// Mobile Navigation Component
export const MobileNavigation = ({ onNext, onPrevious, canNext, canPrevious }) => {
  return (
    <div className="flex justify-between p-4 bg-white border-t">
      <button
        onClick={onPrevious}
        disabled={!canPrevious}
        className="px-4 py-2 border rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

// Smart Prompting Engine Component
export const SmartPromptingEngine = ({ suggestions, onSelect }) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Suggestions</h4>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="p-2 bg-gray-50 border rounded cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(suggestion)}
        >
          <p className="text-sm">{suggestion}</p>
        </div>
      ))}
    </div>
  );
};

// Default export
const ITRJourney = ({ currentStep = 1, totalSteps = 5, onNext, onPrevious }) => {
  const steps = [
    { id: 1, title: 'Personal Information', description: 'Enter your basic details' },
    { id: 2, title: 'Income Sources', description: 'Add your income information' },
    { id: 3, title: 'Deductions', description: 'Claim eligible deductions' },
    { id: 4, title: 'Tax Computation', description: 'Calculate your tax liability' },
    { id: 5, title: 'Review & Submit', description: 'Review and file your return' }
  ];

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="p-6 border rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">ITR Filing Journey</h2>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep} of {totalSteps} completed
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              step.id === currentStep
                ? 'bg-blue-50 border border-blue-200'
                : step.id < currentStep
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.id < currentStep
                  ? 'bg-green-500 text-white'
                  : step.id === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.id}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          onClick={onNext} 
          disabled={currentStep === totalSteps}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {currentStep === totalSteps ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ITRJourney;