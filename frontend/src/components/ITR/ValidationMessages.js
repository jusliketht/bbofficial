// =====================================================
// VALIDATION MESSAGES COMPONENT
// =====================================================

import React from 'react';
import { Card } from '../Common/Card';

const ValidationMessages = ({ errors = [], warnings = [], info = [] }) => {
  if (errors.length === 0 && warnings.length === 0 && info.length === 0) {
    return null;
  }

  return (
    <div className="validation-messages">
      {errors.length > 0 && (
        <Card className="validation-card error-card">
          <div className="validation-header">
            <h3>❌ Validation Errors</h3>
            <span className="error-count">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="validation-content">
            <ul className="error-list">
              {errors.map((error, index) => (
                <li key={index} className="error-item">
                  {typeof error === 'string' ? error : error.message || error}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="validation-card warning-card">
          <div className="validation-header">
            <h3>⚠️ Warnings</h3>
            <span className="warning-count">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="validation-content">
            <ul className="warning-list">
              {warnings.map((warning, index) => (
                <li key={index} className="warning-item">
                  {typeof warning === 'string' ? warning : warning.message || warning}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {info.length > 0 && (
        <Card className="validation-card info-card">
          <div className="validation-header">
            <h3>ℹ️ Information</h3>
            <span className="info-count">{info.length} item{info.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="validation-content">
            <ul className="info-list">
              {info.map((item, index) => (
                <li key={index} className="info-item">
                  {typeof item === 'string' ? item : item.message || item}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValidationMessages;
