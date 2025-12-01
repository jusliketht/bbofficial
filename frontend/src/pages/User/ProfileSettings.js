// =====================================================
// PROFILE SETTINGS - TABBED USER PROFILE MANAGEMENT
// Clean, secure, and easy-to-navigate profile page
// =====================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, FileText, Settings, Save, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/api/authService';
import toast from 'react-hot-toast';
import PANVerificationInline from '../../components/ITR/PANVerificationInline';
import apiClient from '../../services/core/APIClient';

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'bank-accounts', label: 'Bank Accounts', icon: CreditCard },
    { id: 'filings', label: 'My Filings', icon: FileText },
  ];

  const handleSave = async (tabId, data, onSuccess) => {
    setIsLoading(true);
    try {
      if (tabId === 'security') {
        // Handle password set/change
        const hasPassword = user?.hasPassword || user?.passwordHash;
        if (hasPassword) {
          // User has password - change password
          await authService.changePassword(data.currentPassword, data.newPassword);
          toast.success('Password changed successfully');
          if (onSuccess) onSuccess();
        } else {
          // OAuth user without password - set password
          await authService.setPassword(data.newPassword);
          toast.success('Password set successfully');
          if (onSuccess) onSuccess();
          // Reload user profile to get updated hasPassword status
          try {
            const profileData = await authService.getProfile();
            if (profileData?.data?.user) {
              // Update localStorage user object
              const updatedUser = { ...user, ...profileData.data.user, hasPassword: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.warn('Failed to reload user profile after setting password:', error);
          }
        }
      } else if (tabId === 'profile') {
        // If PAN changed, update it separately (backend will verify via SurePass)
        if (data.panNumber && data.panNumber !== user?.panNumber && data.panNumber.length === 10) {
          try {
            await apiClient.patch('/users/pan', { panNumber: data.panNumber });
          } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update PAN');
          }
        }
        // Update other profile fields
        const updateData = {
          fullName: data.fullName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
        };
                // Only update if there are changes
        if (updateData.fullName || updateData.phone || updateData.dateOfBirth) {
          const response = await apiClient.put('/users/profile', updateData);
          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to update profile');
          }
        }
        toast.success('Profile updated successfully');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} onSave={handleSave} isLoading={isLoading} />;
      case 'security':
        return <SecurityTab user={user} onSave={handleSave} isLoading={isLoading} />;
      case 'bank-accounts':
        return <BankAccountsTab onSave={handleSave} isLoading={isLoading} />;
      case 'filings':
        return <FilingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
              <p className="text-gray-700 mt-2">Manage your account information and preferences</p>
            </div>
            <button
              onClick={() => navigate('/preferences')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 text-body-sm font-medium"
            >
              <Settings className="h-4 w-4" />
              Preferences
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ user, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    panNumber: user?.panNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
  });
  const [showPANVerification, setShowPANVerification] = useState(false);
  const [panVerified, setPanVerified] = useState(user?.panVerified || false);
  const [originalPAN, setOriginalPAN] = useState(user?.panNumber || '');

  const handlePANChange = (e) => {
    const newPAN = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, panNumber: newPAN }));
    // If PAN changed and is 10 characters, show verification
    if (newPAN.length === 10 && newPAN !== originalPAN) {
      setPanVerified(false);
      setShowPANVerification(true);
    } else if (newPAN.length !== 10) {
      setPanVerified(false);
      setShowPANVerification(false);
    }
  };

  const handlePANVerified = (verificationResult) => {
    setPanVerified(true);
    setShowPANVerification(false);
    setOriginalPAN(formData.panNumber);
    toast.success('PAN verified successfully!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If PAN is provided and changed, require verification
    if (formData.panNumber && formData.panNumber.length === 10) {
      if (formData.panNumber !== originalPAN && !panVerified) {
        toast.error('Please verify your PAN number before saving');
        setShowPANVerification(true);
        return;
      }
    }
    onSave('profile', formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-6">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={handlePANChange}
                  maxLength={10}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono uppercase"
                  placeholder="ABCDE1234F"
                />
                {formData.panNumber && formData.panNumber.length === 10 && !panVerified && formData.panNumber !== originalPAN && (
                  <button
                    type="button"
                    onClick={() => setShowPANVerification(true)}
                    className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Verify PAN
                  </button>
                )}
              </div>
              {panVerified && formData.panNumber && (
                <p className="text-xs text-success-600 flex items-center">
                  <span className="mr-1">✓</span> PAN Verified
                </p>
              )}
              {formData.panNumber && formData.panNumber.length === 10 && formData.panNumber !== originalPAN && !panVerified && (
                <p className="text-xs text-warning-600">
                  Please verify your PAN number before saving
                </p>
              )}
            </div>
          </div>
          {/* PAN Verification Inline */}
          {showPANVerification && formData.panNumber && formData.panNumber.length === 10 && (
            <div className="md:col-span-2 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <PANVerificationInline
                panNumber={formData.panNumber}
                onVerified={handlePANVerified}
                onCancel={() => setShowPANVerification(false)}
                memberType="self"
                compact={true}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Security Tab Component
const SecurityTab = ({ user, onSave, isLoading }) => {
  const hasPassword = user?.hasPassword || user?.passwordHash;
  const isOAuthUser = user?.authProvider === 'GOOGLE' || user?.authProvider === 'OTHER';
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // If user has password, require current password
    if (hasPassword && !formData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    onSave('security', formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-6">Security Settings</h2>
      {!hasPassword && isOAuthUser && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-body-sm text-blue-800">
            You signed up with Google OAuth. Set a password to enable email/password login.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {hasPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required={hasPassword}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {hasPassword ? 'New Password *' : 'Password *'}
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {hasPassword ? 'Confirm New Password *' : 'Confirm Password *'}
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
            minLength={8}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {hasPassword ? 'Updating...' : 'Setting...'}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {hasPassword ? 'Update Password' : 'Set Password'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Bank Accounts Tab Component
const BankAccountsTab = () => {
  const [bankAccounts] = useState([
    { id: 1, bankName: 'HDFC Bank', accountNumber: '****1234', ifsc: 'HDFC0001234', isPrimary: true },
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-6">Bank Accounts</h2>
      <div className="space-y-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{account.bankName}</h3>
                <p className="text-sm text-gray-600">Account: {account.accountNumber}</p>
                <p className="text-sm text-gray-600">IFSC: {account.ifsc}</p>
              </div>
              <div className="text-right">
                {account.isPrimary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Primary
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 transition-colors">
          <CreditCard className="w-6 h-6 mx-auto mb-2" />
          Add Bank Account
        </button>
      </div>
    </div>
  );
};

// Filings Tab Component
const FilingsTab = () => {
  const filings = [
    { year: '2023-24', status: 'Completed', refund: 45000, date: '2024-08-15' },
    { year: '2022-23', status: 'Completed', refund: 32000, date: '2023-08-20' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-6">My Filings</h2>
      <div className="space-y-4">
        {filings.map((filing) => (
          <div key={filing.year} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Assessment Year {filing.year}</h3>
                <p className="text-sm text-gray-600">Filed on {new Date(filing.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  {filing.status}
                </span>
                <p className="text-sm font-medium text-green-600">
                  Refund: ₹{filing.refund.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSettings;
