import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ITRSelection, 
  SmartPrompt, 
  StepIndicator, 
  DynamicFormField, 
  IncomeSourceCard, 
  TaxSummaryCard, 
  MobileSummaryDashboard, 
  MobileNavigation,
  SmartPromptingEngine
} from '../../components/ITRJourney';
// import { 
//   ITRJSONSchemaGenerator, 
//   FinancialProfileData 
// } from '../data/ITRJourneyData';
import syncApiClient from '../../services/syncApiClient';
import '../../styles/itr-journey.css';

// Complete ITR Journey Component
const CompleteITRJourney = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedITR, setSelectedITR] = useState(location.state?.itrType || null);
  const [formData, setFormData] = useState({
    personalInfo: {},
    incomeSources: {
      salary: { hasIncome: false, amount: 0, employer: '' },
      houseProperty: { hasIncome: false, amount: 0, type: 'self_occupied' },
      business: { hasIncome: false, amount: 0, type: '' },
      capitalGains: { hasIncome: false, amount: 0, type: '' },
      otherSources: { hasIncome: false, amount: 0, details: '' }
    },
    deductions: {
      section80C: 0,
      section80D: 0,
      section80TTA: 0,
      section80G: 0,
      section24: 0
    }
  });
  const [taxData, setTaxData] = useState(null);
  // const [isCalculating, setIsCalculating] = useState(false); // Will be used when implementing real-time tax computation
  const [prompt, setPrompt] = useState(null);

  // Initialize engines (commented out for now to avoid unused variable warnings)
  // const [schemaGenerator] = useState(new ITRJSONSchemaGenerator());
  // const [profileGenerator] = useState(new FinancialProfileData());

  // Generate ITR schema based on selected ITR (commented out for now)
  // const itrSchema = useMemo(() => {
  //   if (!selectedITR) return null;
  //   return schemaGenerator.generateITRSchema(selectedITR, formData);
  // }, [selectedITR, formData, schemaGenerator]);

  // Calculate total income
  const totalIncome = useMemo(() => {
    return Object.values(formData.incomeSources)
      .filter(source => source.hasIncome)
      .reduce((sum, source) => sum + (source.amount || 0), 0);
  }, [formData.incomeSources]);

  // Calculate total deductions
  const totalDeductions = useMemo(() => {
    return Object.values(formData.deductions)
      .reduce((sum, deduction) => sum + (deduction || 0), 0);
  }, [formData.deductions]);

  // Real-time tax computation
  const { data: computedTaxData, isLoading: isTaxCalculating } = useQuery({
    queryKey: ['tax-computation', totalIncome, totalDeductions],
    queryFn: async () => {
      if (totalIncome === 0) return null;
      
      const incomeData = { totalIncome };
      const deductions = formData.deductions;
      
      const response = await syncApiClient.client.post('/tax/compare-regimes', {
        incomeData,
        deductions
      });
      
      return response.data;
    },
    enabled: totalIncome > 0,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Update tax data when computation completes
  useEffect(() => {
    if (computedTaxData?.success) {
      setTaxData(computedTaxData.data);
      // setIsCalculating(false); // Will be used when implementing real-time tax computation
    }
  }, [computedTaxData]);

  // Handle ITR selection
  const handleITRSelection = (itrType) => {
    setSelectedITR(itrType);
    setCurrentStep(2);
  };

  // Handle form data updates
  const handleFormDataUpdate = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle income source updates
  const handleIncomeSourceUpdate = (sourceType, field, value) => {
    setFormData(prev => ({
      ...prev,
      incomeSources: {
        ...prev.incomeSources,
        [sourceType]: {
          ...prev.incomeSources[sourceType],
          [field]: value
        }
      }
    }));
  };

  // Handle income source toggle
  const handleIncomeSourceToggle = (sourceType, hasIncome) => {
    setFormData(prev => ({
      ...prev,
      incomeSources: {
        ...prev.incomeSources,
        [sourceType]: {
          ...prev.incomeSources[sourceType],
          hasIncome
        }
      }
    }));
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      handleFormSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      const submissionData = {
        itrType: selectedITR,
        formData: formData,
        taxData: taxData,
        totalIncome: totalIncome,
        totalDeductions: totalDeductions
      };

      const response = await syncApiClient.client.post('/itr/submit', submissionData);
      
      if (response.data.success) {
        navigate('/acknowledgment', { 
          state: { 
            filingId: response.data.filingId,
            taxData: taxData 
          } 
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Generate financial profile (commented out for now)
  // const financialProfile = useMemo(() => {
  //   if (!taxData) return null;
  //   
  //   const incomeData = { totalIncome };
  //   const deductions = formData.deductions;
  //   
  //   return profileGenerator.generateProfile(incomeData, deductions, taxData);
  // }, [taxData, totalIncome, formData.deductions, profileGenerator]);

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ITRSelection 
            onITRSelect={handleITRSelection}
            selectedITR={selectedITR}
          />
        );
      
      case 2:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Personal Information</h2>
              <p className="card-subtitle">Enter your basic details</p>
            </div>
            <div className="card-content">
              <div className="form-grid">
                <DynamicFormField
                  fieldName="name"
                  fieldConfig={{
                    type: 'text',
                    label: 'Full Name',
                    required: true,
                    placeholder: 'Enter your full name'
                  }}
                  value={formData.personalInfo.name}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'name', value)}
                />
                <DynamicFormField
                  fieldName="pan"
                  fieldConfig={{
                    type: 'text',
                    label: 'PAN Number',
                    required: true,
                    placeholder: 'Enter PAN number'
                  }}
                  value={formData.personalInfo.pan}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'pan', value)}
                />
                <DynamicFormField
                  fieldName="aadhaar"
                  fieldConfig={{
                    type: 'text',
                    label: 'Aadhaar Number',
                    required: true,
                    placeholder: 'Enter Aadhaar number'
                  }}
                  value={formData.personalInfo.aadhaar}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'aadhaar', value)}
                />
                <DynamicFormField
                  fieldName="mobile"
                  fieldConfig={{
                    type: 'text',
                    label: 'Mobile Number',
                    required: true,
                    placeholder: 'Enter mobile number'
                  }}
                  value={formData.personalInfo.mobile}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'mobile', value)}
                />
                <DynamicFormField
                  fieldName="email"
                  fieldConfig={{
                    type: 'email',
                    label: 'Email Address',
                    required: true,
                    placeholder: 'Enter email address'
                  }}
                  value={formData.personalInfo.email}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'email', value)}
                />
                <DynamicFormField
                  fieldName="address"
                  fieldConfig={{
                    type: 'textarea',
                    label: 'Address',
                    required: true,
                    placeholder: 'Enter your address'
                  }}
                  value={formData.personalInfo.address}
                  onChange={(value) => handleFormDataUpdate('personalInfo', 'address', value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="income-sources-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Income Sources</h2>
                <p className="card-subtitle">Add your income details</p>
              </div>
              <div className="card-content">
                {Object.entries(formData.incomeSources).map(([sourceType, sourceData]) => (
                  <IncomeSourceCard
                    key={sourceType}
                    sourceType={sourceType}
                    sourceData={sourceData}
                    onUpdate={handleIncomeSourceUpdate}
                    onToggle={handleIncomeSourceToggle}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="deductions-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Deductions</h2>
                <p className="card-subtitle">Add your tax-saving investments</p>
              </div>
              <div className="card-content">
                <div className="form-grid">
                  <DynamicFormField
                    fieldName="section80C"
                    fieldConfig={{
                      type: 'number',
                      label: 'Section 80C (Max ₹1,50,000)',
                      required: false,
                      placeholder: 'Enter amount'
                    }}
                    value={formData.deductions.section80C}
                    onChange={(value) => handleFormDataUpdate('deductions', 'section80C', value)}
                  />
                  <DynamicFormField
                    fieldName="section80D"
                    fieldConfig={{
                      type: 'number',
                      label: 'Section 80D (Max ₹25,000)',
                      required: false,
                      placeholder: 'Enter amount'
                    }}
                    value={formData.deductions.section80D}
                    onChange={(value) => handleFormDataUpdate('deductions', 'section80D', value)}
                  />
                  <DynamicFormField
                    fieldName="section80TTA"
                    fieldConfig={{
                      type: 'number',
                      label: 'Section 80TTA (Max ₹10,000)',
                      required: false,
                      placeholder: 'Enter amount'
                    }}
                    value={formData.deductions.section80TTA}
                    onChange={(value) => handleFormDataUpdate('deductions', 'section80TTA', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="review-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Review & Submit</h2>
                <p className="card-subtitle">Review your information before submitting</p>
              </div>
              <div className="card-content">
                {/* Desktop Summary Dashboard */}
                <div className="desktop-summary-dashboard">
                  <div className="summary-grid">
                    <TaxSummaryCard 
                      taxData={taxData} 
                      isCalculating={isTaxCalculating} 
                    />
                    {/* Additional summary cards */}
                  </div>
                </div>
                
                {/* Mobile Summary Dashboard */}
                <div className="mobile-summary-dashboard">
                  <MobileSummaryDashboard
                    taxData={taxData}
                    incomeData={{ totalIncome }}
                    deductions={formData.deductions}
                    isCalculating={isTaxCalculating}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Get steps configuration
  const steps = [
    { id: 1, title: 'ITR Selection', icon: '📋' },
    { id: 2, title: 'Personal Info', icon: '👤' },
    { id: 3, title: 'Income Sources', icon: '💰' },
    { id: 4, title: 'Deductions', icon: '🛡️' },
    { id: 5, title: 'Review & Submit', icon: '✅' }
  ];

  return (
    <div className="itr-journey-container">
      {/* Step Indicator */}
      <StepIndicator 
        currentStep={currentStep}
        totalSteps={steps.length}
        steps={steps}
      />

      {/* Main Content */}
      <div className="main-content">
        {renderCurrentStep()}
      </div>

      {/* Smart Prompt */}
      {prompt && (
        <SmartPrompt
          prompt={prompt}
          onAccept={() => setPrompt(null)}
          onDecline={() => setPrompt(null)}
          onLearnMore={() => setPrompt(null)}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNavigation
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        isNextDisabled={currentStep === 1 && !selectedITR}
        nextLabel={currentStep === 5 ? 'Submit' : 'Next'}
      />

      {/* Desktop Navigation */}
      <div className="desktop-navigation">
        <div className="nav-buttons">
          <button 
            className="btn-secondary"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          <button 
            className="btn-primary"
            onClick={handleNextStep}
            disabled={currentStep === 1 && !selectedITR}
          >
            {currentStep === 5 ? 'Submit ITR' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Intake Form Component
const EnhancedIntakeForm = () => {
  const location = useLocation();
  const { filingId } = useParams();
  
  const [formData] = useState({
    itrType: location.state?.itrType || 'ITR-1',
    assessmentYear: '2024-25',
    personalInfo: {},
    incomeSources: {},
    deductions: {},
    documents: []
  });

  // Auto-save functionality
  const { mutate: autoSave } = useMutation({
    mutationFn: async (data) => {
      const response = await syncApiClient.client.post('/itr/auto-save', {
        filingId,
        formData: data
      });
      return response.data;
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  // Auto-save on form data change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSave(formData);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave]);

  return <CompleteITRJourney />;
};

// Real-time Tax Computation Hook
const useRealTimeTaxComputation = (incomeData, deductions) => {
  const [taxData, setTaxData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculateTax = async () => {
      if (!incomeData || !deductions) return;
      
      setIsCalculating(true);
      
      try {
        const response = await syncApiClient.client.post('/tax/compare-regimes', {
          incomeData,
          deductions
        });
        
        if (response.data.success) {
          setTaxData(response.data.data);
        }
      } catch (error) {
        console.error('Tax calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce calculation
    const timeoutId = setTimeout(calculateTax, 500);
    return () => clearTimeout(timeoutId);
  }, [incomeData, deductions]);

  return { taxData, isCalculating };
};

// Smart Prompting Hook
const useSmartPrompting = (selectedITR, userProfile) => {
  const [prompt, setPrompt] = useState(null);
  const [promptingEngine] = useState(new SmartPromptingEngine());

  const checkForPrompts = (itrType, profile) => {
    const validation = promptingEngine.detectIncorrectSelection(itrType, profile);
    
    if (validation.length > 0) {
      const smartPrompt = promptingEngine.generateSmartPrompt(itrType, validation[0], profile);
      setPrompt(smartPrompt);
    }
  };

  const clearPrompt = () => {
    setPrompt(null);
  };

  return {
    prompt,
    checkForPrompts,
    clearPrompt
  };
};

// Form Validation Hook
const useFormValidation = (formData, itrSchema) => {
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.itrType) {
          stepErrors.itrType = 'Please select an ITR form';
        }
        break;
      
      case 2:
        if (!formData.personalInfo.name) {
          stepErrors.name = 'Name is required';
        }
        if (!formData.personalInfo.pan) {
          stepErrors.pan = 'PAN is required';
        }
        break;
      
      case 3:
        const hasIncome = Object.values(formData.incomeSources)
          .some(source => source.hasIncome);
        if (!hasIncome) {
          stepErrors.incomeSources = 'At least one income source is required';
        }
        break;
      
      default:
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  return {
    errors,
    validateStep
  };
};

export default CompleteITRJourney;

export {
  CompleteITRJourney,
  EnhancedIntakeForm,
  useRealTimeTaxComputation,
  useSmartPrompting,
  useFormValidation
};
