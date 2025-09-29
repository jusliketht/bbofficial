// Justification: Bank Details Form Component - Comprehensive bank account information collection
// Provides form interface for collecting all bank account details required for ITR filing
// Essential for ITR filing as bank details are required for refund processing
// Supports multiple bank accounts, primary account selection, and validation

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  CreditCard,
  Building,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bankDetailsService } from '../../services/bankDetailsService';

// Validation schema for bank account
const bankAccountSchema = yup.object({
  account_number: yup.string()
    .required('Account number is required')
    .matches(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  
  ifsc_code: yup.string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  
  bank_name: yup.string()
    .required('Bank name is required')
    .min(2, 'Bank name must be at least 2 characters'),
  
  account_holder_name: yup.string()
    .nullable(),
  
  account_type: yup.string()
    .oneOf(['SAVINGS', 'CURRENT', 'FIXED', 'RECURRING'], 'Invalid account type')
    .default('SAVINGS'),
  
  branch_name: yup.string()
    .nullable(),
});

const BankDetailsForm = ({ intakeId, defaultValues, onSave, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showAccountNumbers, setShowAccountNumbers] = useState({});

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(bankAccountSchema),
    defaultValues: {
      account_number: '',
      ifsc_code: '',
      bank_name: '',
      account_holder_name: '',
      account_type: 'SAVINGS',
      branch_name: '',
    }
  });

  // Load existing data on mount
  useEffect(() => {
    if (intakeId && !defaultValues) {
      loadBankDetails();
    }
  }, [intakeId]);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      const response = await bankDetailsService.getBankDetails(intakeId);
      if (response.success && response.data) {
        setBankAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateBankDetails = async () => {
    try {
      const response = await bankDetailsService.validateBankDetails(intakeId);
      if (response.success) {
        setValidation(response.data.validation);
      }
    } catch (error) {
      console.error('Failed to validate bank details:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await bankDetailsService.updateBankDetails(intakeId, {
        bank_accounts: bankAccounts,
        primary_account_id: bankAccounts.find(acc => acc.is_primary)?.id || null
      });
      
      if (response.success) {
        toast.success('Bank details saved successfully!');
        await validateBankDetails();
        if (onSave) onSave(response.data);
      } else {
        toast.error(response.error || 'Failed to save bank details');
      }
    } catch (error) {
      toast.error('Failed to save bank details');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (onNext) onNext();
  };

  const addBankAccount = async (accountData) => {
    try {
      const response = await bankDetailsService.addBankAccount(intakeId, accountData);
      if (response.success) {
        setBankAccounts(prev => [...prev, response.data.account]);
        setShowAddAccount(false);
        toast.success('Bank account added successfully!');
      } else {
        toast.error(response.error || 'Failed to add bank account');
      }
    } catch (error) {
      toast.error('Failed to add bank account');
      console.error('Add account error:', error);
    }
  };

  const updateBankAccount = async (accountId, accountData) => {
    try {
      const response = await bankDetailsService.updateBankAccount(intakeId, accountId, accountData);
      if (response.success) {
        setBankAccounts(prev => prev.map(acc => 
          acc.id === accountId ? response.data : acc
        ));
        setEditingAccount(null);
        toast.success('Bank account updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update bank account');
      }
    } catch (error) {
      toast.error('Failed to update bank account');
      console.error('Update account error:', error);
    }
  };

  const removeBankAccount = async (accountId) => {
    try {
      const response = await bankDetailsService.removeBankAccount(intakeId, accountId);
      if (response.success) {
        setBankAccounts(prev => prev.filter(acc => acc.id !== accountId));
        toast.success('Bank account removed successfully!');
      } else {
        toast.error(response.error || 'Failed to remove bank account');
      }
    } catch (error) {
      toast.error('Failed to remove bank account');
      console.error('Remove account error:', error);
    }
  };

  const setPrimaryAccount = async (accountId) => {
    try {
      const response = await bankDetailsService.updateBankAccount(intakeId, accountId, {
        is_primary: true
      });
      if (response.success) {
        setBankAccounts(prev => prev.map(acc => ({
          ...acc,
          is_primary: acc.id === accountId
        })));
        toast.success('Primary account updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update primary account');
      }
    } catch (error) {
      toast.error('Failed to update primary account');
      console.error('Set primary account error:', error);
    }
  };

  const toggleAccountNumberVisibility = (accountId) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
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
          <CreditCard className="h-8 w-8 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Bank Accounts Section */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Bank Accounts
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAccount(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </button>
            </div>

            {bankAccounts.length > 0 ? (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{account.bank_name}</h4>
                          {account.is_primary && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Account Number:</span>
                            <div className="flex items-center">
                              <p className="text-sm text-gray-900 font-mono">
                                {showAccountNumbers[account.id] ? account.account_number : maskAccountNumber(account.account_number)}
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleAccountNumberVisibility(account.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              >
                                {showAccountNumbers[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">IFSC Code:</span>
                            <p className="text-sm text-gray-900 font-mono">{account.ifsc_code}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">Account Type:</span>
                            <p className="text-sm text-gray-900 capitalize">{account.account_type?.toLowerCase()}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">Branch:</span>
                            <p className="text-sm text-gray-900">{account.branch_name || 'Not specified'}</p>
                          </div>
                          
                          {account.account_holder_name && (
                            <div className="md:col-span-2">
                              <span className="text-sm font-medium text-gray-500">Account Holder:</span>
                              <p className="text-sm text-gray-900">{account.account_holder_name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {!account.is_primary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryAccount(account.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                            title="Set as Primary"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => setEditingAccount(account)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit Account"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeBankAccount(account.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Remove Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No bank accounts added yet</p>
                <p className="text-sm">Add bank accounts for refund processing</p>
              </div>
            )}
          </div>

          {/* Add Bank Account Modal */}
          {showAddAccount && (
            <BankAccountModal
              onSave={addBankAccount}
              onCancel={() => setShowAddAccount(false)}
            />
          )}

          {/* Edit Bank Account Modal */}
          {editingAccount && (
            <BankAccountModal
              account={editingAccount}
              onSave={(data) => updateBankAccount(editingAccount.id, data)}
              onCancel={() => setEditingAccount(null)}
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
                    <span>Bank details are complete</span>
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
                  <p className="font-medium">
                    Total Accounts: {validation.hasAccounts ? bankAccounts.length : 0} | 
                    Primary Account: {validation.hasPrimaryAccount ? 'Set' : 'Not Set'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={validateBankDetails}
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
                {loading ? 'Saving...' : 'Save Bank Details'}
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

// Bank Account Modal Component
const BankAccountModal = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    account_number: account?.account_number || '',
    ifsc_code: account?.ifsc_code || '',
    bank_name: account?.bank_name || '',
    account_holder_name: account?.account_holder_name || '',
    account_type: account?.account_type || 'SAVINGS',
    branch_name: account?.branch_name || '',
    is_primary: account?.is_primary || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {account ? 'Edit Bank Account' : 'Add Bank Account'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              required
              placeholder="9-18 digits"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code *
            </label>
            <input
              type="text"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              required
              placeholder="ABCD0123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
              <option value="FIXED">Fixed Deposit</option>
              <option value="RECURRING">Recurring Deposit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              name="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {!account && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Set as primary account
              </label>
            </div>
          )}

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
              {account ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankDetailsForm;