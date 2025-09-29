import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  User,
  Search,
  Users,
  Building,
  Shield
} from 'lucide-react';
import '../styles/itr-journey.css';

// PAN Validation Service
class PANValidationService {
  constructor() {
    this.panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    this.panCache = new Map();
  }

  validatePAN(pan) {
    if (!pan) {
      return { isValid: false, error: 'PAN is required' };
    }

    const cleanPAN = pan.toUpperCase().trim();
    
    if (!this.panPattern.test(cleanPAN)) {
      return { 
        isValid: false, 
        error: 'Invalid PAN format. Format: ABCDE1234F' 
      };
    }

    return { isValid: true, pan: cleanPAN };
  }

  async checkPANExists(pan) {
    try {
      // Check if PAN exists in our system
      const response = await fetch(`/api/user/check-pan/${pan}`);
      const data = await response.json();
      
      return {
        exists: data.exists,
        userInfo: data.userInfo || null,
        isActive: data.isActive || false
      };
    } catch (error) {
      console.error('PAN check error:', error);
      return { exists: false, userInfo: null, isActive: false };
    }
  }

  formatPAN(pan) {
    return pan.toUpperCase().trim();
  }
}

// Filing Context Component
const FilingContextSelector = ({ onContextSelected, onCancel }) => {
  const [selectedContext, setSelectedContext] = useState(null);

  const contexts = [
    {
      id: 'self',
      title: 'File for Myself',
      description: 'I am filing my own ITR',
      icon: User,
      color: 'blue',
      userType: 'self'
    },
    {
      id: 'family',
      title: 'File for Family Member',
      description: 'I am filing for a family member',
      icon: Users,
      color: 'green',
      userType: 'family'
    },
    {
      id: 'client',
      title: 'File for Client (CA)',
      description: 'I am a CA filing for my client',
      icon: Building,
      color: 'purple',
      userType: 'ca_client'
    },
    {
      id: 'admin',
      title: 'File for User (Admin)',
      description: 'I am an admin filing for a user',
      icon: Shield,
      color: 'red',
      userType: 'admin_user'
    }
  ];

  const handleContextSelect = (context) => {
    setSelectedContext(context);
    onContextSelected(context);
  };

  return (
    <div className="filing-context-selector">
      <div className="card">
        <div className="card-header">
          <button
            onClick={onCancel}
            className="btn-link"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="card-title">Who are you filing for?</h1>
          <p className="card-subtitle">Select the appropriate filing context</p>
        </div>

        <div className="card-content">
          <div className="context-grid">
            {contexts.map((context) => {
              const IconComponent = context.icon;
              return (
                <div
                  key={context.id}
                  className={`context-card ${selectedContext?.id === context.id ? 'selected' : ''} ${context.color}`}
                  onClick={() => handleContextSelect(context)}
                >
                  <div className="context-icon">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="context-title">{context.title}</h3>
                  <p className="context-description">{context.description}</p>
                  <div className="context-badge">
                    {context.userType === 'self' && 'Self Filing'}
                    {context.userType === 'family' && 'Family Member'}
                    {context.userType === 'ca_client' && 'CA Client'}
                    {context.userType === 'admin_user' && 'Admin User'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-footer">
          <button 
            className="btn-primary"
            onClick={() => selectedContext && onContextSelected(selectedContext)}
            disabled={!selectedContext}
          >
            Continue with {selectedContext?.title || 'Selection'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// PAN Entry Component
const PANEntryForm = ({ filingContext, onPANVerified, onBack }) => {
  const [pan, setPAN] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [panService] = useState(new PANValidationService());

  const handlePANSubmit = async (e) => {
    e.preventDefault();
    
    const validation = panService.validatePAN(pan);
    if (!validation.isValid) {
      setValidationResult({ error: validation.error });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const panCheck = await panService.checkPANExists(validation.pan);
      
      if (panCheck.exists) {
        setUserInfo(panCheck.userInfo);
        setValidationResult({ 
          success: true, 
          message: 'PAN found in system',
          userInfo: panCheck.userInfo
        });
      } else {
        setValidationResult({ 
          info: true, 
          message: 'PAN not found - will create new user profile',
          userInfo: null
        });
      }
    } catch (error) {
      setValidationResult({ 
        error: 'Failed to verify PAN. Please try again.' 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    onPANVerified({
      pan: panService.formatPAN(pan),
      userInfo: userInfo,
      filingContext: filingContext,
      isNewUser: !userInfo
    });
  };

  const getContextMessage = () => {
    switch (filingContext.userType) {
      case 'self':
        return 'Enter your PAN number to continue';
      case 'family':
        return 'Enter the family member\'s PAN number';
      case 'ca_client':
        return 'Enter your client\'s PAN number';
      case 'admin_user':
        return 'Enter the user\'s PAN number';
      default:
        return 'Enter PAN number to continue';
    }
  };

  return (
    <div className="pan-entry-form">
      <div className="card">
        <div className="card-header">
          <button
            onClick={onBack}
            className="btn-link"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Context Selection
          </button>
          <h1 className="card-title">PAN Verification</h1>
          <p className="card-subtitle">{getContextMessage()}</p>
        </div>

        <div className="card-content">
          <form onSubmit={handlePANSubmit} className="pan-form">
            <div className="form-group">
              <label className="form-label">
                PAN Number
                <span className="required">*</span>
              </label>
              <div className="pan-input-container">
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPAN(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className={`form-input pan-input ${validationResult?.error ? 'error' : ''}`}
                  maxLength="10"
                  disabled={isValidating}
                />
                <button
                  type="submit"
                  className="btn-secondary pan-verify-btn"
                  disabled={!pan || isValidating}
                >
                  {isValidating ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Verify
                </button>
              </div>
              <div className="pan-help-text">
                Format: 5 letters + 4 numbers + 1 letter (e.g., ABCDE1234F)
              </div>
            </div>

            {validationResult && (
              <div className={`validation-result ${validationResult.error ? 'error' : validationResult.success ? 'success' : 'info'}`}>
                <div className="validation-icon">
                  {validationResult.error && <AlertCircle className="w-5 h-5" />}
                  {validationResult.success && <CheckCircle className="w-5 h-5" />}
                  {validationResult.info && <Info className="w-5 h-5" />}
                </div>
                <div className="validation-message">
                  <p>{validationResult.error || validationResult.message}</p>
                  {validationResult.userInfo && (
                    <div className="user-info-preview">
                      <h4>User Information:</h4>
                      <p><strong>Name:</strong> {validationResult.userInfo.name}</p>
                      <p><strong>Email:</strong> {validationResult.userInfo.email}</p>
                      <p><strong>Status:</strong> {validationResult.userInfo.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="card-footer">
          <button 
            className="btn-primary"
            onClick={handleContinue}
            disabled={!validationResult || validationResult.error}
          >
            Continue to ITR Selection
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Filing Entry Component
const FilingEntry = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [filingContext, setFilingContext] = useState(null);
  const [panData, setPANData] = useState(null);

  const handleContextSelected = (context) => {
    setFilingContext(context);
    setCurrentStep(2);
  };

  const handlePANVerified = (data) => {
    setPANData(data);
    setCurrentStep(3);
  };

  const handleBackToContext = () => {
    setCurrentStep(1);
    setFilingContext(null);
  };

  const handleBackToPAN = () => {
    setCurrentStep(2);
    setPANData(null);
  };

  const handleContinueToITR = () => {
    // Navigate to ITR selection with context and PAN data
    navigate('/itr-selection', {
      state: {
        filingContext: filingContext,
        panData: panData,
        isNewUser: panData.isNewUser
      }
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FilingContextSelector
            onContextSelected={handleContextSelected}
            onCancel={() => navigate('/dashboard')}
          />
        );
      
      case 2:
        return (
          <PANEntryForm
            filingContext={filingContext}
            onPANVerified={handlePANVerified}
            onBack={handleBackToContext}
          />
        );
      
      case 3:
        return (
          <div className="filing-summary">
            <div className="card">
              <div className="card-header">
                <button
                  onClick={handleBackToPAN}
                  className="btn-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to PAN Entry
                </button>
                <h1 className="card-title">Filing Summary</h1>
                <p className="card-subtitle">Review your filing details</p>
              </div>

              <div className="card-content">
                <div className="summary-grid">
                  <div className="summary-item">
                    <h3>Filing Context</h3>
                    <p>{filingContext.title}</p>
                    <span className="summary-badge">{filingContext.userType}</span>
                  </div>
                  
                  <div className="summary-item">
                    <h3>PAN Number</h3>
                    <p className="pan-display">{panData.pan}</p>
                    <span className={`summary-badge ${panData.isNewUser ? 'new' : 'existing'}`}>
                      {panData.isNewUser ? 'New User' : 'Existing User'}
                    </span>
                  </div>
                  
                  {panData.userInfo && (
                    <div className="summary-item">
                      <h3>User Information</h3>
                      <p><strong>Name:</strong> {panData.userInfo.name}</p>
                      <p><strong>Email:</strong> {panData.userInfo.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-primary"
                  onClick={handleContinueToITR}
                >
                  Continue to ITR Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="filing-entry-container">
      <div className="step-indicator">
        <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
        </div>
      </div>

      <div className="step-labels">
        <span className={`step-label ${currentStep === 1 ? 'active' : ''}`}>Context</span>
        <span className={`step-label ${currentStep === 2 ? 'active' : ''}`}>PAN</span>
        <span className={`step-label ${currentStep === 3 ? 'active' : ''}`}>Summary</span>
      </div>

      {renderCurrentStep()}
    </div>
  );
};

export default FilingEntry;
