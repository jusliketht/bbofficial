// =====================================================
// ITR FILING ORCHESTRATOR - CANONICAL FRONTEND COMPONENT
// Single component handling all ITR types (ITR1, ITR2, ITR3, ITR4)
// =====================================================

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilingContext } from '../../contexts/FilingContext';
import { AuthContext } from '../../contexts/AuthContext';
import PersonalInfoForm from '../../components/ITR/PersonalInfoForm';
import IncomeForm from '../../components/ITR/IncomeForm';
import DeductionForm from '../../components/ITR/DeductionForm';
import TaxSummaryPanel from '../../components/ITR/TaxSummaryPanel';
import ReviewForm from '../../components/ITR/ReviewForm';
import ValidationMessages from '../../components/ITR/ValidationMessages';
import { enterpriseLogger } from '../../utils/logger';

const ITRFiling = () => {
  const { itrType, draftId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { 
    filingData, 
    updateFilingData, 
    saveDraft, 
    validateDraft, 
    computeTax, 
    submitITR,
    loadDraft,
    loading: contextLoading 
  } = useFilingContext();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [taxComputation, setTaxComputation] = useState(null);

  // Valid ITR types
  const validTypes = ['ITR1', 'ITR2', 'ITR3', 'ITR4'];
  
  // Step configuration based on ITR type
  const getSteps = (type) => {
    const baseSteps = [
      { id: 'personalInfo', title: 'Personal Information', component: 'PersonalInfoForm' },
      { id: 'income', title: 'Income Details', component: 'IncomeForm' },
      { id: 'deductions', title: 'Deductions', component: 'DeductionForm' },
      { id: 'taxComputation', title: 'Tax Computation', component: 'TaxSummaryPanel' },
      { id: 'review', title: 'Review & Submit', component: 'ReviewForm' }
    ];

    if (type === 'ITR2') {
      baseSteps.splice(2, 0, { id: 'capitalGains', title: 'Capital Gains', component: 'CapitalGainsForm' });
    }
    
    if (type === 'ITR3') {
      baseSteps.splice(2, 0, { id: 'businessIncome', title: 'Business Income', component: 'BusinessIncomeForm' });
    }
    
    if (type === 'ITR4') {
      baseSteps.splice(2, 0, { id: 'presumptiveIncome', title: 'Presumptive Income', component: 'PresumptiveIncomeForm' });
    }

    return baseSteps;
  };

  const steps = getSteps(itrType);

  // Load existing draft if draftId is provided
  useEffect(() => {
    if (draftId) {
      handleLoadDraft();
    } else {
      initializeNewFiling();
    }
  }, [draftId, itrType]);

  const handleLoadDraft = async () => {
    try {
      await loadDraft(draftId);
      enterpriseLogger.info('Draft loaded successfully', { draftId, itrType });
    } catch (error) {
      enterpriseLogger.error('Failed to load draft', { error: error.message, draftId });
      navigate('/dashboard');
    }
  };

  const initializeNewFiling = () => {
    const initialData = {
      personalInfo: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        panNumber: user?.panNumber || '',
        dateOfBirth: user?.dateOfBirth || ''
      },
      income: {},
      deductions: {},
      itrType: itrType
    };
    updateFilingData(initialData);
  };

  const handleStepChange = async (stepIndex) => {
    // Validate current step before moving
    if (stepIndex > currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }
    setCurrentStep(stepIndex);
  };

  const validateCurrentStep = async () => {
    try {
      const response = await validateDraft(filingData);
      setValidation(response);
      return response.isValid;
    } catch (error) {
      enterpriseLogger.error('Validation failed', { error: error.message });
      return false;
    }
  };

  const handleSaveDraft = async () => {
    try {
      const response = await saveDraft(itrType, filingData);
      enterpriseLogger.info('Draft saved successfully', { draftId: response.draft.id });
      return response.draft.id;
    } catch (error) {
      enterpriseLogger.error('Failed to save draft', { error: error.message });
      throw error;
    }
  };

  const handleComputeTax = async () => {
    try {
      const response = await computeTax(filingData);
      setTaxComputation(response.computation);
      enterpriseLogger.info('Tax computation completed', { totalTax: response.computation.totalTax });
    } catch (error) {
      enterpriseLogger.error('Tax computation failed', { error: error.message });
    }
  };

  const handleSubmitITR = async () => {
    try {
      const response = await submitITR(filingData);
      enterpriseLogger.info('ITR submitted successfully', { filingId: response.filing.id });
      navigate('/dashboard', { state: { success: 'ITR submitted successfully!' } });
    } catch (error) {
      enterpriseLogger.error('ITR submission failed', { error: error.message });
    }
  };

  const renderStepComponent = () => {
    const currentStepData = steps[currentStep];
    
    switch (currentStepData.component) {
      case 'PersonalInfoForm':
        return (
          <PersonalInfoForm 
            data={filingData.personalInfo} 
            onChange={(data) => updateFilingData({ personalInfo: data })}
            onNext={() => handleStepChange(currentStep + 1)}
            onPrevious={() => handleStepChange(currentStep - 1)}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
          />
        );
      case 'IncomeForm':
        return (
          <IncomeForm 
            data={filingData.income} 
            itrType={itrType} 
            onChange={(data) => updateFilingData({ income: data })}
            onNext={() => handleStepChange(currentStep + 1)}
            onPrevious={() => handleStepChange(currentStep - 1)}
          />
        );
      case 'DeductionForm':
        return (
          <DeductionForm 
            data={filingData.deductions} 
            itrType={itrType} 
            onChange={(data) => updateFilingData({ deductions: data })}
            onNext={() => handleStepChange(currentStep + 1)}
            onPrevious={() => handleStepChange(currentStep - 1)}
          />
        );
      case 'TaxSummaryPanel':
        return (
          <TaxSummaryPanel 
            incomeData={filingData.income}
            deductionData={filingData.deductions}
            personalInfo={filingData.personalInfo}
            computation={taxComputation}
            onCompute={setTaxComputation}
            onNext={() => handleStepChange(currentStep + 1)}
            onPrevious={() => handleStepChange(currentStep - 1)}
            loading={contextLoading}
          />
        );
      case 'CapitalGainsForm':
        return <CapitalGainsForm data={filingData.capitalGains} onChange={(data) => updateFilingData({ capitalGains: data })} />;
      case 'BusinessIncomeForm':
        return <BusinessIncomeForm data={filingData.businessIncome} onChange={(data) => updateFilingData({ businessIncome: data })} />;
      case 'PresumptiveIncomeForm':
        return <PresumptiveIncomeForm data={filingData.presumptiveIncome} onChange={(data) => updateFilingData({ presumptiveIncome: data })} />;
      case 'ReviewForm':
        return (
          <ReviewForm 
            data={filingData} 
            onSave={handleSaveDraft} 
            onSubmit={handleSubmitITR}
            onPrevious={() => handleStepChange(currentStep - 1)}
            taxComputation={taxComputation}
            loading={contextLoading}
          />
        );
      default:
        return <div>Step component not found</div>;
    }
  };

  if (!validTypes.includes(itrType)) {
    return (
      <div className="error-container">
        <h2>Invalid ITR Type</h2>
        <p>The ITR type "{itrType}" is not supported.</p>
        <button onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  if (contextLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="itr-filing-container">
      <div className="filing-header">
        <h1>ITR {itrType} Filing</h1>
        <div className="progress-indicator">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
      </div>

      <div className="filing-content">
        <div className="step-navigation">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`step-button ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => handleStepChange(index)}
              disabled={index > currentStep + 1}
            >
              {step.title}
            </button>
          ))}
        </div>

        <div className="step-content">
          {validation.errors.length > 0 && (
            <ValidationMessages errors={validation.errors} warnings={validation.warnings} />
          )}
          
          {renderStepComponent()}
        </div>
      </div>
    </div>
  );
};

export default ITRFiling;