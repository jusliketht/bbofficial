// =====================================================
// USER DASHBOARD - WORLD-CLASS UX DESIGN
// Empty state and active state with guided momentum
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Users, TrendingUp, FileText, Settings, History } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FilingLaunchpad from '../../components/Dashboard/FilingLaunchpad';
import QuickActionCard from '../../components/Dashboard/QuickActionCard';
import FilingStatusTracker from '../../components/Dashboard/FilingStatusTracker';
import WelcomeModal from '../../components/UI/WelcomeModal';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasFiled, setHasFiled] = useState(false); // In real app, this would come from API
  const [loading, setLoading] = useState(true);

  // Check if user needs welcome modal
  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowWelcomeModal(true);
    }
    setLoading(false);
  }, [user]);

  // Mock filing data - in real app, this would come from API
  const filingData = {
    status: 'processing',
    acknowledgementNumber: 'ITR-2024-25-123456789',
    filingDate: '2024-10-12',
    assessmentYear: '2024-25'
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    // Update user context
    if (updateUser) {
      updateUser({ ...user, onboardingCompleted: true });
    }
  };

  const handleStartFiling = () => {
    navigate('/start-filing');
  };

  const handleUploadDocuments = () => {
    navigate('/documents');
  };

  const handleManageMembers = () => {
    navigate('/add-members');
  };

  const handleExploreTaxSaving = () => {
    toast.success('Tax-saving options coming soon!');
  };

  const handleViewSettings = () => {
    navigate('/profile');
  };

  const handleViewHistory = () => {
    navigate('/filing-history');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeComplete}
        user={user}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 mt-2">
            {hasFiled 
              ? 'Here\'s your filing status and next steps.' 
              : 'Let\'s get your taxes filed quickly and securely.'
            }
          </p>
        </div>

        {/* Primary Component */}
        <div className="mb-8">
          {hasFiled ? (
            <FilingStatusTracker filing={filingData} />
          ) : (
            <FilingLaunchpad onStartFiling={handleStartFiling} />
          )}
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            title="Upload Documents"
            description="Upload Form 16, bank statements, and other tax documents"
            icon={Upload}
            color="blue"
            onClick={handleUploadDocuments}
          />
          
          <QuickActionCard
            title="Manage Family Members"
            description="Add family members for joint filing and tax optimization"
            icon={Users}
            color="green"
            onClick={handleManageMembers}
          />
          
          <QuickActionCard
            title="Explore Tax-Saving Options"
            description="Discover investment opportunities to reduce your tax liability"
            icon={TrendingUp}
            color="purple"
            onClick={handleExploreTaxSaving}
            isComingSoon={true}
          />
          
          <QuickActionCard
            title="Settings & Profile"
            description="Manage your account settings and personal information"
            icon={Settings}
            color="orange"
            onClick={handleViewSettings}
          />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Filing History"
            description="View and download your previous tax returns"
            icon={History}
            color="gray"
            onClick={handleViewHistory}
          />
          
          <QuickActionCard
            title="Document Library"
            description="Access all your uploaded documents and forms"
            icon={FileText}
            color="gray"
            onClick={handleUploadDocuments}
          />
        </div>

        {/* Recent Activity Section */}
        {hasFiled && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">ITR Filed Successfully</p>
                      <p className="text-sm text-gray-600">Assessment Year 2024-25</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Oct 12, 2024</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Documents Uploaded</p>
                      <p className="text-sm text-gray-600">Form 16 and bank statements</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Oct 10, 2024</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Profile Created</p>
                      <p className="text-sm text-gray-600">Welcome to BurnBlack</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Oct 8, 2024</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;