// =====================================================
// DEDUCTION FORM COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { Button } from '../Common/Button';
import { Card } from '../Common/Card';
import Tooltip from '../Common/Tooltip';
import { enterpriseLogger } from '../../utils/logger';

const DeductionForm = ({ data = {}, onChange, onNext, onPrevious, itrType = 'ITR1' }) => {
  const [formData, setFormData] = useState({
    section80C: {
      lifeInsurance: data.section80C?.lifeInsurance || '',
      providentFund: data.section80C?.providentFund || '',
      elss: data.section80C?.elss || '',
      nsc: data.section80C?.nsc || '',
      sukanyaSamriddhi: data.section80C?.sukanyaSamriddhi || '',
      ppf: data.section80C?.ppf || '',
      homeLoanPrincipal: data.section80C?.homeLoanPrincipal || '',
      tuitionFees: data.section80C?.tuitionFees || '',
      total80C: data.section80C?.total80C || ''
    },
    section80D: {
      healthInsurance: data.section80D?.healthInsurance || '',
      preventiveHealthCheckup: data.section80D?.preventiveHealthCheckup || '',
      total80D: data.section80D?.total80D || ''
    },
    section80E: {
      educationLoanInterest: data.section80E?.educationLoanInterest || ''
    },
    section80G: {
      donations: data.section80G?.donations || ''
    },
    section80TTA: {
      savingsInterest: data.section80TTA?.savingsInterest || ''
    },
    section80TTB: {
      bankInterest: data.section80TTB?.bankInterest || ''
    },
    section24: {
      homeLoanInterest: data.section24?.homeLoanInterest || ''
    },
    otherDeductions: {
      standardDeduction: data.otherDeductions?.standardDeduction || '50000',
      hra: data.otherDeductions?.hra || '',
      lta: data.otherDeductions?.lta || '',
      medicalReimbursement: data.otherDeductions?.medicalReimbursement || ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const calculateTotalDeductions = () => {
    let total = 0;
    
    // Section 80C (max ₹1,50,000)
    const total80C = Math.min(
      Object.values(formData.section80C).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
      150000
    );
    total += total80C;
    
    // Section 80D (max ₹25,000 for self, ₹50,000 for senior citizens)
    const total80D = Math.min(
      Object.values(formData.section80D).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
      25000
    );
    total += total80D;
    
    // Section 80E (no limit)
    total += parseFloat(formData.section80E.educationLoanInterest) || 0;
    
    // Section 80G (no limit)
    total += parseFloat(formData.section80G.donations) || 0;
    
    // Section 80TTA (max ₹10,000)
    const total80TTA = Math.min(
      parseFloat(formData.section80TTA.savingsInterest) || 0,
      10000
    );
    total += total80TTA;
    
    // Section 80TTB (max ₹50,000 for senior citizens)
    const total80TTB = Math.min(
      parseFloat(formData.section80TTB.bankInterest) || 0,
      50000
    );
    total += total80TTB;
    
    // Section 24 (max ₹2,00,000)
    const total24 = Math.min(
      parseFloat(formData.section24.homeLoanInterest) || 0,
      200000
    );
    total += total24;
    
    // Other deductions
    total += parseFloat(formData.otherDeductions.standardDeduction) || 0;
    total += parseFloat(formData.otherDeductions.hra) || 0;
    total += parseFloat(formData.otherDeductions.lta) || 0;
    total += parseFloat(formData.otherDeductions.medicalReimbursement) || 0;
    
    return total;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Section 80C validation
    const total80C = Object.values(formData.section80C).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (total80C > 150000) {
      newErrors.section80C = 'Total Section 80C deductions cannot exceed ₹1,50,000';
    }
    
    // Section 80D validation
    const total80D = Object.values(formData.section80D).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (total80D > 25000) {
      newErrors.section80D = 'Total Section 80D deductions cannot exceed ₹25,000';
    }
    
    // Section 80TTA validation
    const total80TTA = parseFloat(formData.section80TTA.savingsInterest) || 0;
    if (total80TTA > 10000) {
      newErrors.section80TTA = 'Section 80TTA deduction cannot exceed ₹10,000';
    }
    
    // Section 80TTB validation
    const total80TTB = parseFloat(formData.section80TTB.bankInterest) || 0;
    if (total80TTB > 50000) {
      newErrors.section80TTB = 'Section 80TTB deduction cannot exceed ₹50,000';
    }
    
    // Section 24 validation
    const total24 = parseFloat(formData.section24.homeLoanInterest) || 0;
    if (total24 > 200000) {
      newErrors.section24 = 'Section 24 deduction cannot exceed ₹2,00,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNext = async () => {
    setIsValidating(true);
    const isValid = validateForm();
    
    if (isValid) {
      enterpriseLogger.info('Deduction form validated successfully', { itrType, totalDeductions: calculateTotalDeductions() });
      onNext && onNext();
    } else {
      enterpriseLogger.warn('Deduction form validation failed', { errors });
    }
    setIsValidating(false);
  };

  const handlePrevious = () => {
    onPrevious && onPrevious();
  };

  const renderSection80C = () => (
    <div className="form-section">
      <h3>Section 80C Deductions (Max ₹1,50,000)</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lifeInsurance">
            Life Insurance Premium
            <Tooltip content="Premium paid for life insurance policies">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="lifeInsurance"
            type="number"
            value={formData.section80C.lifeInsurance}
            onChange={(e) => handleInputChange('section80C', 'lifeInsurance', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="providentFund">
            Provident Fund
            <Tooltip content="Employee Provident Fund contribution">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="providentFund"
            type="number"
            value={formData.section80C.providentFund}
            onChange={(e) => handleInputChange('section80C', 'providentFund', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="elss">
            ELSS (Equity Linked Savings Scheme)
            <Tooltip content="Investment in ELSS mutual funds">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="elss"
            type="number"
            value={formData.section80C.elss}
            onChange={(e) => handleInputChange('section80C', 'elss', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nsc">
            NSC (National Savings Certificate)
            <Tooltip content="Investment in NSC">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="nsc"
            type="number"
            value={formData.section80C.nsc}
            onChange={(e) => handleInputChange('section80C', 'nsc', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sukanyaSamriddhi">
            Sukanya Samriddhi Yojana
            <Tooltip content="Investment in Sukanya Samriddhi Yojana">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="sukanyaSamriddhi"
            type="number"
            value={formData.section80C.sukanyaSamriddhi}
            onChange={(e) => handleInputChange('section80C', 'sukanyaSamriddhi', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ppf">
            PPF (Public Provident Fund)
            <Tooltip content="Investment in PPF">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="ppf"
            type="number"
            value={formData.section80C.ppf}
            onChange={(e) => handleInputChange('section80C', 'ppf', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="homeLoanPrincipal">
            Home Loan Principal
            <Tooltip content="Principal repayment of home loan">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="homeLoanPrincipal"
            type="number"
            value={formData.section80C.homeLoanPrincipal}
            onChange={(e) => handleInputChange('section80C', 'homeLoanPrincipal', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tuitionFees">
            Tuition Fees
            <Tooltip content="Tuition fees for children's education">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="tuitionFees"
            type="number"
            value={formData.section80C.tuitionFees}
            onChange={(e) => handleInputChange('section80C', 'tuitionFees', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderSection80D = () => (
    <div className="form-section">
      <h3>Section 80D Deductions (Max ₹25,000)</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="healthInsurance">
            Health Insurance Premium
            <Tooltip content="Premium paid for health insurance">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="healthInsurance"
            type="number"
            value={formData.section80D.healthInsurance}
            onChange={(e) => handleInputChange('section80D', 'healthInsurance', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="preventiveHealthCheckup">
            Preventive Health Checkup
            <Tooltip content="Expenses on preventive health checkup (max ₹5,000)">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="preventiveHealthCheckup"
            type="number"
            value={formData.section80D.preventiveHealthCheckup}
            onChange={(e) => handleInputChange('section80D', 'preventiveHealthCheckup', e.target.value)}
            placeholder="0"
            max="5000"
          />
        </div>
      </div>
    </div>
  );

  const renderOtherDeductions = () => (
    <div className="form-section">
      <h3>Other Deductions</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="standardDeduction">
            Standard Deduction
            <Tooltip content="Standard deduction for salaried employees">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="standardDeduction"
            type="number"
            value={formData.otherDeductions.standardDeduction}
            onChange={(e) => handleInputChange('otherDeductions', 'standardDeduction', e.target.value)}
            placeholder="50000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hra">
            House Rent Allowance
            <Tooltip content="HRA exemption">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="hra"
            type="number"
            value={formData.otherDeductions.hra}
            onChange={(e) => handleInputChange('otherDeductions', 'hra', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lta">
            Leave Travel Allowance
            <Tooltip content="LTA exemption">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="lta"
            type="number"
            value={formData.otherDeductions.lta}
            onChange={(e) => handleInputChange('otherDeductions', 'lta', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalReimbursement">
            Medical Reimbursement
            <Tooltip content="Medical reimbursement exemption">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="medicalReimbursement"
            type="number"
            value={formData.otherDeductions.medicalReimbursement}
            onChange={(e) => handleInputChange('otherDeductions', 'medicalReimbursement', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalDeductions = () => (
    <div className="form-section">
      <h3>Additional Deductions</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="educationLoanInterest">
            Education Loan Interest (80E)
            <Tooltip content="Interest paid on education loan (no limit)">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="educationLoanInterest"
            type="number"
            value={formData.section80E.educationLoanInterest}
            onChange={(e) => handleInputChange('section80E', 'educationLoanInterest', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="donations">
            Donations (80G)
            <Tooltip content="Donations to eligible institutions">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="donations"
            type="number"
            value={formData.section80G.donations}
            onChange={(e) => handleInputChange('section80G', 'donations', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="savingsInterest">
            Savings Interest (80TTA)
            <Tooltip content="Interest from savings account (max ₹10,000)">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="savingsInterest"
            type="number"
            value={formData.section80TTA.savingsInterest}
            onChange={(e) => handleInputChange('section80TTA', 'savingsInterest', e.target.value)}
            placeholder="0"
            max="10000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bankInterest">
            Bank Interest (80TTB)
            <Tooltip content="Interest from bank deposits for senior citizens (max ₹50,000)">
              <span className="help-icon">?</span>
            </Tooltip>
          </label>
          <input
            id="bankInterest"
            type="number"
            value={formData.section80TTB.bankInterest}
            onChange={(e) => handleInputChange('section80TTB', 'bankInterest', e.target.value)}
            placeholder="0"
            max="50000"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="homeLoanInterest">
          Home Loan Interest (24)
          <Tooltip content="Interest paid on home loan (max ₹2,00,000)">
            <span className="help-icon">?</span>
          </Tooltip>
        </label>
        <input
          id="homeLoanInterest"
          type="number"
          value={formData.section24.homeLoanInterest}
          onChange={(e) => handleInputChange('section24', 'homeLoanInterest', e.target.value)}
          placeholder="0"
          max="200000"
        />
      </div>
    </div>
  );

  return (
    <div className="deduction-form">
      <Card className="form-card">
        <div className="form-header">
          <h2>Deductions - {itrType}</h2>
          <p>Enter your tax-saving deductions and exemptions</p>
        </div>

        <div className="form-content">
          {renderSection80C()}
          {renderSection80D()}
          {renderOtherDeductions()}
          {renderAdditionalDeductions()}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="validation-errors">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="error-message">{error}</div>
            ))}
          </div>
        )}

        <div className="deduction-summary">
          <h3>Total Deductions: ₹{calculateTotalDeductions().toLocaleString()}</h3>
        </div>

        <div className="form-actions">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isValidating}
          >
            Previous
          </Button>
          
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isValidating}
            loading={isValidating}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeductionForm;