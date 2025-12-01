// =====================================================
// TAXES PAID FORM COMPONENT
// For all ITR forms - Taxes paid details
// =====================================================

import React from 'react';

const TaxesPaidForm = ({ data, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TDS (₹)</label>
          <input
            type="number"
            value={data?.tds || 0}
            onChange={(e) => handleChange('tds', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Tax Deducted at Source</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Advance Tax (₹)</label>
          <input
            type="number"
            value={data?.advanceTax || 0}
            onChange={(e) => handleChange('advanceTax', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Advance tax paid during the year</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Self Assessment Tax (₹)</label>
          <input
            type="number"
            value={data?.selfAssessmentTax || 0}
            onChange={(e) => handleChange('selfAssessmentTax', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Self assessment tax paid</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Total Taxes Paid:</strong> ₹{((data?.tds || 0) + (data?.advanceTax || 0) + (data?.selfAssessmentTax || 0)).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default TaxesPaidForm;

