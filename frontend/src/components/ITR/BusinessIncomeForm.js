// =====================================================
// BUSINESS INCOME FORM COMPONENT
// =====================================================

import React, { useState } from 'react';
import Button from '../UI/Button';
import Card from '../common/Card';

const BusinessIncomeForm = ({ data = {}, onChange, onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    businessType: data.businessType || '',
    turnover: data.turnover || '',
    profit: data.profit || '',
    expenses: data.expenses || '',
    ...data
  });

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange && onChange(newData);
  };

  const handleNext = () => {
    onNext && onNext(formData);
  };

  const handlePrevious = () => {
    onPrevious && onPrevious(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Business Income Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select business type</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llp">Limited Liability Partnership</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Turnover (₹)
              </label>
              <input
                type="number"
                value={formData.turnover}
                onChange={(e) => handleChange('turnover', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter annual turnover"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Net Profit (₹)
              </label>
              <input
                type="number"
                value={formData.profit}
                onChange={(e) => handleChange('profit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter net profit"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessIncomeForm;
