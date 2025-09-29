// Justification: Tax Details Form Component - Comprehensive tax payment information collection
// Provides form interface for collecting all tax payment details required for ITR filing
// Essential for ITR filing as tax payment information is required for accurate tax computation
// Supports TDS, advance tax, self-assessment tax, and other tax payment details

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Calculator,
  Receipt,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taxDetailsService } from '../../services/taxDetailsService';

// Comprehensive validation schema for tax details
const taxDetailsSchema = yup.object({
  // Employer Information
  employer_category: yup.string()
    .oneOf(['GOVT', 'PSU', 'PRIVATE', 'OTHER'], 'Invalid employer category')
    .nullable(),
  
  // Tax Payment Details
  tds_salary: yup.number()
    .min(0, 'TDS amount cannot be negative')
    .nullable(),
  
  tds_other: yup.number()
    .min(0, 'TDS amount cannot be negative')
    .nullable(),
  
  advance_tax_paid: yup.number()
    .min(0, 'Advance tax amount cannot be negative')
    .nullable(),
  
  self_assessment_tax_paid: yup.number()
    .min(0, 'Self assessment tax amount cannot be negative')
    .nullable(),
});

const TaxDetailsForm = ({ intakeId, defaultValues, onSave, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(null);
  const [tdsCertificates, setTdsCertificates] = useState([]);
  const [showAddCertificate, setShowAddCertificate] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(taxDetailsSchema),
    defaultValues: {
      employer_category: defaultValues?.employer_category || '',
      tds_salary: defaultValues?.tds_salary || 0,
      tds_other: defaultValues?.tds_other || 0,
      advance_tax_paid: defaultValues?.advance_tax_paid || 0,
      self_assessment_tax_paid: defaultValues?.self_assessment_tax_paid || 0,
    }
  });

  const tdsSalary = watch('tds_salary') || 0;
  const tdsOther = watch('tds_other') || 0;
  const advanceTax = watch('advance_tax_paid') || 0;
  const selfAssessmentTax = watch('self_assessment_tax_paid') || 0;
  const totalTaxPaid = tdsSalary + tdsOther + advanceTax + selfAssessmentTax;

  // Load existing data on mount
  useEffect(() => {
    if (intakeId && !defaultValues) {
      loadTaxDetails();
    }
  }, [intakeId]);

  const loadTaxDetails = async () => {
    try {
      setLoading(true);
      const response = await taxDetailsService.getTaxDetails(intakeId);
      if (response.success) {
        reset(response.data);
        if (response.data.tds_certificates) {
          setTdsCertificates(response.data.tds_certificates);
        }
      }
    } catch (error) {
      console.error('Failed to load tax details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateTaxDetails = async () => {
    try {
      const response = await taxDetailsService.validateTaxDetails(intakeId);
      if (response.success) {
        setValidation(response.data.validation);
      }
    } catch (error) {
      console.error('Failed to validate tax details:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await taxDetailsService.updateTaxDetails(intakeId, data);
      
      if (response.success) {
        toast.success('Tax details saved successfully!');
        await validateTaxDetails();
        if (onSave) onSave(response.data);
      } else {
        toast.error(response.error || 'Failed to save tax details');
      }
    } catch (error) {
      toast.error('Failed to save tax details');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (onNext) onNext();
  };

  const addTdsCertificate = async (certificateData) => {
    try {
      const response = await taxDetailsService.addTdsCertificate(intakeId, certificateData);
      if (response.success) {
        setTdsCertificates(prev => [...prev, response.data.certificate]);
        setShowAddCertificate(false);
        toast.success('TDS certificate added successfully!');
      } else {
        toast.error(response.error || 'Failed to add TDS certificate');
      }
    } catch (error) {
      toast.error('Failed to add TDS certificate');
      console.error('Add certificate error:', error);
    }
  };

  const removeTdsCertificate = async (certificateId) => {
    try {
      const response = await taxDetailsService.removeTdsCertificate(intakeId, certificateId);
      if (response.success) {
        setTdsCertificates(prev => prev.filter(cert => cert.id !== certificateId));
        toast.success('TDS certificate removed successfully!');
      } else {
        toast.error(response.error || 'Failed to remove TDS certificate');
      }
    } catch (error) {
      toast.error('Failed to remove TDS certificate');
      console.error('Remove certificate error:', error);
    }
  };

  if (loading && !defaultValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Calculator className="h-8 w-8 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Tax Payment Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Employer Information Section */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Employer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employer Category */}
              <div>
                <label htmlFor="employer_category" className="block text-sm font-medium text-gray-700 mb-2">
                  Employer Category
                </label>
                <select
                  id="employer_category"
                  {...register('employer_category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Employer Category</option>
                  <option value="GOVT">Government</option>
                  <option value="PSU">Public Sector Undertaking</option>
                  <option value="PRIVATE">Private Sector</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.employer_category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.employer_category.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Payment Details Section */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Tax Payment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TDS from Salary */}
              <div>
                <label htmlFor="tds_salary" className="block text-sm font-medium text-gray-700 mb-2">
                  TDS from Salary (₹)
                </label>
                <input
                  type="number"
                  id="tds_salary"
                  {...register('tds_salary')}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.tds_salary && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tds_salary.message}
                  </p>
                )}
              </div>

              {/* TDS from Other Sources */}
              <div>
                <label htmlFor="tds_other" className="block text-sm font-medium text-gray-700 mb-2">
                  TDS from Other Sources (₹)
                </label>
                <input
                  type="number"
                  id="tds_other"
                  {...register('tds_other')}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.tds_other && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tds_other.message}
                  </p>
                )}
              </div>

              {/* Advance Tax Paid */}
              <div>
                <label htmlFor="advance_tax_paid" className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Tax Paid (₹)
                </label>
                <input
                  type="number"
                  id="advance_tax_paid"
                  {...register('advance_tax_paid')}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.advance_tax_paid && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.advance_tax_paid.message}
                  </p>
                )}
              </div>

              {/* Self Assessment Tax Paid */}
              <div>
                <label htmlFor="self_assessment_tax_paid" className="block text-sm font-medium text-gray-700 mb-2">
                  Self Assessment Tax Paid (₹)
                </label>
                <input
                  type="number"
                  id="self_assessment_tax_paid"
                  {...register('self_assessment_tax_paid')}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.self_assessment_tax_paid && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.self_assessment_tax_paid.message}
                  </p>
                )}
              </div>
            </div>

            {/* Total Tax Paid Summary */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">Total Tax Paid:</span>
                <span className="text-2xl font-bold text-green-600">₹{totalTaxPaid.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>TDS from Salary: ₹{tdsSalary.toLocaleString()}</div>
                  <div>TDS from Other: ₹{tdsOther.toLocaleString()}</div>
                  <div>Advance Tax: ₹{advanceTax.toLocaleString()}</div>
                  <div>Self Assessment: ₹{selfAssessmentTax.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* TDS Certificates Section */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                TDS Certificates
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCertificate(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </button>
            </div>

            {tdsCertificates.length > 0 ? (
              <div className="space-y-3">
                {tdsCertificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Certificate No:</span>
                            <p className="text-sm text-gray-900">{certificate.certificate_number}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Deductor:</span>
                            <p className="text-sm text-gray-900">{certificate.deductor_name}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">TDS Amount:</span>
                            <p className="text-sm text-gray-900">₹{certificate.tds_amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTdsCertificate(certificate.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No TDS certificates added yet</p>
                <p className="text-sm">Add TDS certificates to track your tax deductions</p>
              </div>
            )}
          </div>

          {/* Add TDS Certificate Modal */}
          {showAddCertificate && (
            <TdsCertificateModal
              onSave={addTdsCertificate}
              onCancel={() => setShowAddCertificate(false)}
            />
          )}

          {/* Validation Summary */}
          {validation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Validation Summary
              </h4>
              <div className="space-y-2">
                {validation.isComplete ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Tax details are complete</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Missing required fields: {validation.missingFields.join(', ')}</span>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div className="text-yellow-600">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside ml-4">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-blue-600">
                  <p className="font-medium">Total Tax Paid: ₹{validation.totalTaxPaid?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={validateTaxDetails}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Validate
            </button>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Tax Details'}
              </button>
              
              {onNext && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// TDS Certificate Modal Component
const TdsCertificateModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    certificate_number: '',
    deductor_name: '',
    deductor_tan: '',
    tds_amount: '',
    tax_deducted_date: '',
    certificate_date: '',
    assessment_year: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add TDS Certificate</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Number *
            </label>
            <input
              type="text"
              name="certificate_number"
              value={formData.certificate_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deductor Name *
            </label>
            <input
              type="text"
              name="deductor_name"
              value={formData.deductor_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deductor TAN
            </label>
            <input
              type="text"
              name="deductor_tan"
              value={formData.deductor_tan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TDS Amount *
            </label>
            <input
              type="number"
              name="tds_amount"
              value={formData.tds_amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Year
            </label>
            <input
              type="text"
              name="assessment_year"
              value={formData.assessment_year}
              onChange={handleChange}
              placeholder="2024-25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxDetailsForm;