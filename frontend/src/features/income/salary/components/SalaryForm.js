// =====================================================
// SALARY FORM COMPONENT
// For all ITR forms - Salary income input
// =====================================================

import React from 'react';
import Form16Upload from '../../../../components/ITR/core/Form16Upload';

const SalaryForm = ({ data, onUpdate, selectedITR, onForm16Extracted }) => {
  const handleSalaryChange = (value) => {
    onUpdate({ salary: parseFloat(value) || 0 });
  };

  const handleForm16AutoPopulate = (form16Data) => {
    if (form16Data.salary) {
      handleSalaryChange(form16Data.salary);
    }
    if (onForm16Extracted) {
      onForm16Extracted(form16Data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form 16 Upload for ITR-1 */}
      {(selectedITR === 'ITR-1' || selectedITR === 'ITR1') && (
        <div className="mb-4">
          <Form16Upload
            onExtractionComplete={(result) => {
              console.log('Form 16 extracted:', result);
            }}
            onAutoPopulate={handleForm16AutoPopulate}
            className="mb-4"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Income (₹)</label>
        <input
          type="number"
          value={data?.salary || 0}
          onChange={(e) => handleSalaryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your total salary income for the financial year
        </p>
      </div>
    </div>
  );
};

export default SalaryForm;

