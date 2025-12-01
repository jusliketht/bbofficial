// =====================================================
// USER DASHBOARD - WORLD-CLASS UX DESIGN
// Empty state and active state with guided momentum
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Users, TrendingUp, FileText, Settings, History, Pause, Play, ArrowRight, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import itrService from '../../services/api/itrService';
import apiClient from '../../services/core/APIClient';
import FilingStatusBadge from '../../components/ITR/FilingStatusBadge';
import InvoiceBadge from '../../components/ITR/InvoiceBadge';

// Components
import FilingLaunchpad from '../../components/Dashboard/FilingLaunchpad';
import QuickActionCard from '../../components/Dashboard/QuickActionCard';
import FilingStatusTracker from '../../components/Dashboard/FilingStatusTracker';
import DashboardWidgets from '../../components/Dashboard/DashboardWidgets';
import WelcomeModal from '../../components/UI/WelcomeModal';

const UserDashboard = () => {
  const { user, updateUser, justLoggedIn, setJustLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isInitializing = useRef(false); // Prevent multiple simultaneous initializations

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasFiled, setHasFiled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ongoingFilings, setOngoingFilings] = useState([]);
  const [completedFilings, setCompletedFilings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFilings: 0,
    pendingActions: 0,
    documentsUploaded: 0,
    familyMembers: 0,
    taxSaved: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  const [refundData, setRefundData] = useState({
    pendingRefunds: [],
    creditedRefunds: [],
    totalPendingAmount: 0,
    totalCreditedAmount: 0,
  });

  // Check if user needs welcome modal and load dashboard data
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (isInitializing.current || !user) {
      return;
    }

    const initializeDashboard = async () => {
      isInitializing.current = true;

      // Only show welcome modal if user just logged in AND hasn't completed onboarding
      if (justLoggedIn && !user.onboardingCompleted) {
        setShowWelcomeModal(true);
        setJustLoggedIn(false); // Clear the flag after showing modal
      }

      try {
        setLoading(true);
        setError(null);

        // Load dashboard data from API
        try {
          const dashboardResponse = await apiClient.get('/users/dashboard');
          if (dashboardResponse.data?.success && dashboardResponse.data?.data) {
            const dashboardData = dashboardResponse.data.data;

            // Set dashboard stats
            setDashboardStats({
              totalFilings: dashboardData.overview?.totalFilings || 0,
              pendingActions: dashboardData.draftStats?.activeDrafts || dashboardData.overview?.draftFilings || 0,
              documentsUploaded: dashboardData.overview?.totalDocuments || 0,
              familyMembers: dashboardData.overview?.familyMembers || 0,
              taxSaved: 0, // Not provided by API currently
            });

            // Set recent activity
            if (dashboardData.recentActivity && Array.isArray(dashboardData.recentActivity)) {
              setRecentActivity(dashboardData.recentActivity);
            }
          }
        } catch (dashboardError) {
          console.error('Failed to load dashboard stats:', dashboardError);
          // Don't show toast for dashboard API failure, just log it
          // The dashboard will still work with filings data
        }

        // Load user's filings
        try {
          const filingsResponse = await itrService.getUserITRs();
          const filings = filingsResponse.data?.filings || filingsResponse.filings || [];

          const ongoing = filings.filter(f => ['draft', 'paused'].includes(f.status));
          const completed = filings.filter(f => ['submitted', 'acknowledged', 'processed'].includes(f.status));

          setOngoingFilings(ongoing);
          setCompletedFilings(completed);
          setHasFiled(filings.length > 0);

          // Update pending actions based on ongoing filings if dashboard API didn't provide it
          setDashboardStats(prev => ({
            ...prev,
            pendingActions: prev.pendingActions || ongoing.length,
          }));
        } catch (filingsError) {
          console.error('Failed to load filings:', filingsError);
          toast.error('Failed to load filing history. Some features may be limited.');
        }

        // Load refund data
        try {
          const refundResponse = await apiClient.get('/itr/refunds/history');
          if (refundResponse.data?.success && refundResponse.data?.refunds) {
            const refunds = refundResponse.data.refunds;
            const pending = refunds.filter(r => ['processing', 'issued'].includes(r.status));
            const credited = refunds.filter(r => r.status === 'credited');

            setRefundData({
              pendingRefunds: pending,
              creditedRefunds: credited,
              totalPendingAmount: pending.reduce((sum, r) => sum + (r.expectedAmount || 0), 0),
              totalCreditedAmount: credited.reduce((sum, r) => sum + (r.expectedAmount || 0) + (r.interestAmount || 0), 0),
            });
          }
        } catch (refundError) {
          console.error('Failed to load refund data:', refundError);
          // Don't show error toast, refunds are optional
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setError(error.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeDashboard();
  }, [user?.id, justLoggedIn, setJustLoggedIn]); // Only depend on user.id to prevent re-runs when user object reference changes

  // Mock filing data - in real app, this would come from API
  const filingData = {
    status: 'processing',
    acknowledgementNumber: 'ITR-2024-25-123456789',
    filingDate: '2024-10-12',
    assessmentYear: '2024-25',
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    // Update user context
    if (updateUser) {
      updateUser({ ...user, onboardingCompleted: true });
    }
  };

  const handleStartFiling = () => {
    navigate('/itr/select-person');
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

  const handleCheckRefund = () => {
    navigate('/itr/refund-tracking');
  };

  const handleDownloadITRV = async () => {
    // Navigate to filing history or download directly
    if (completedFilings.length > 0) {
      try {
        await itrService.downloadAcknowledgment(completedFilings[0].id);
        toast.success('ITR-V downloaded successfully');
      } catch (error) {
        toast.error('Failed to download ITR-V');
        navigate('/filing-history');
      }
    } else {
      navigate('/filing-history');
    }
  };

  const handleViewFinancialProfile = () => {
    navigate('/financial-profile');
  };

  const calculateProgress = (filing) => {
    // Simple progress calculation based on status
    // In a real implementation, this would be based on completed sections
    if (filing.status === 'submitted') return 100;
    if (filing.status === 'acknowledged') return 100;
    if (filing.status === 'processed') return 100;
    if (filing.status === 'paused') return 50; // Assume 50% if paused
    if (filing.status === 'draft') return 30; // Assume 30% if draft
    return 0;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !hasFiled && ongoingFilings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-error-500 text-display-lg mb-4">⚠️</div>
          <h2 className="text-heading-lg font-semibold text-black mb-2">Failed to Load Dashboard</h2>
          <p className="text-body-md text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeComplete}
        user={user}
      />

      {/* Compact Layout: Header + Widgets in one row */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-6 mb-4">
          {/* Page Header - Compact */}
          <div className="flex-1 mb-3 lg:mb-0">
            <h1 className="text-heading-lg sm:text-display-sm font-semibold text-black mb-1">
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-body-sm sm:text-body-md text-gray-600">
              {hasFiled
                ? 'Here\'s your filing status and next steps.'
                : 'Let\'s get your taxes filed quickly and securely.'
              }
            </p>
          </div>
        </div>

        {/* Dashboard Widgets - Compact */}
        <DashboardWidgets
          stats={{
            totalFilings: dashboardStats.totalFilings,
            pendingActions: dashboardStats.pendingActions || ongoingFilings.length,
            documentsUploaded: dashboardStats.documentsUploaded,
            taxSaved: dashboardStats.taxSaved,
          }}
        />

        {/* Refund Status Widget - UI.md aligned */}
        {(refundData.pendingRefunds.length > 0 || refundData.creditedRefunds.length > 0) && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-label-md font-semibold text-black">Refund Status</h3>
              <button
                onClick={() => navigate('/itr/refund-tracking')}
                className="text-body-sm text-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                aria-label="View all refunds"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {refundData.pendingRefunds.length > 0 && (
                <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <p className="text-label-sm text-gray-600 mb-1">Pending Refunds</p>
                  <p className="text-number-md font-bold tabular-nums text-black">
                    ₹{refundData.totalPendingAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-body-sm text-gray-600 mt-1">
                    {refundData.pendingRefunds.length} refund{refundData.pendingRefunds.length !== 1 ? 's' : ''} processing
                  </p>
                </div>
              )}
              {refundData.creditedRefunds.length > 0 && (
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-label-sm text-gray-600 mb-1">Credited Refunds</p>
                  <p className="text-number-md font-bold tabular-nums text-black">
                    ₹{refundData.totalCreditedAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-body-sm text-gray-600 mt-1">
                    {refundData.creditedRefunds.length} refund{refundData.creditedRefunds.length !== 1 ? 's' : ''} credited
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Continue Filing Section - Ongoing/Paused Filings */}
      {ongoingFilings.length > 0 && (
        <div className="mb-4">
          <h2 className="text-heading-sm font-semibold text-black mb-3">Continue Filing</h2>
          <div className="space-y-3">
            {ongoingFilings.map((filing) => {
              const progress = calculateProgress(filing);
              const isPaused = filing.status === 'paused';

              return (
                <div
                  key={filing.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/itr/computation?filingId=${filing.id}`, {
                    state: { filing },
                  })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-black">
                          {filing.itrType} - AY {filing.assessmentYear}
                        </h3>
                        <FilingStatusBadge filing={filing} showInvoice={false} className="text-xs" />
                      </div>

                      <div className="flex items-center gap-4 text-body-sm text-gray-600 mb-2">
                        {isPaused && filing.pausedAt && (
                          <span className="flex items-center gap-1">
                            <Pause className="w-4 h-4" />
                            Paused {formatRelativeTime(filing.pausedAt)}
                          </span>
                        )}
                        {!isPaused && filing.updatedAt && (
                          <span>Last edited {formatRelativeTime(filing.updatedAt)}</span>
                        )}
                        {progress > 0 && (
                          <span className="font-medium">{progress}% complete</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPaused ? 'bg-warning-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {/* Invoice Badge */}
                      {filing.invoice && (
                        <div className="mt-2">
                          <InvoiceBadge invoice={filing.invoice} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {isPaused ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/itr/computation?filingId=${filing.id}`, {
                              state: { filing },
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/itr/computation?filingId=${filing.id}`, {
                              state: { filing },
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Component - Compact */}
      <div className="mb-4">
        {hasFiled && ongoingFilings.length === 0 ? (
          <FilingStatusTracker filing={filingData} />
        ) : !hasFiled ? (
          <FilingLaunchpad onStartFiling={handleStartFiling} />
        ) : null}
      </div>

      {/* Quick Actions + More Options in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Quick Action Cards */}
        <div>
          <h2 className="text-heading-sm font-semibold text-black mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
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
            title="Financial Profile"
            description="View your financial history and tax insights"
            icon={BarChart3}
            color="purple"
            onClick={handleViewFinancialProfile}
          />

          <QuickActionCard
            title="Settings & Profile"
            description="Manage your account settings and personal information"
            icon={Settings}
            color="orange"
            onClick={handleViewSettings}
          />
          </div>
        </div>

        {/* Secondary Actions */}
        <div>
          <h2 className="text-heading-sm font-semibold text-black mb-3">More Options</h2>
          <div className="grid grid-cols-1 gap-3">
          <QuickActionCard
            title="Filing History"
            description="View and download your previous tax returns"
            icon={History}
            color="gray"
            onClick={handleViewHistory}
          />

          <QuickActionCard
            title="Check Refund Status"
            description="Track your tax refund status and timeline"
            icon={TrendingUp}
            color="gold"
            onClick={handleCheckRefund}
          />

          <QuickActionCard
            title="Download ITR-V"
            description="Download your ITR-V acknowledgment form"
            icon={FileText}
            color="gray"
            onClick={handleDownloadITRV}
          />
          </div>
        </div>
      </div>

      {/* Recent Activity Section - Compact */}
      {(hasFiled || recentActivity.length > 0) && (
        <div className="mt-4">
          <h2 className="text-heading-sm font-semibold text-black mb-3">Recent Activity</h2>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            {recentActivity.length > 0 ? (
              <div className="space-y-0">
                {recentActivity.slice(0, 5).map((activity, index) => {
                  const getActivityIcon = (type) => {
                    switch (type) {
                      case 'filing_created':
                      case 'filing_submitted':
                        return { icon: FileText, bgColor: 'bg-success-50', iconColor: 'text-success-500' };
                      case 'document_uploaded':
                        return { icon: Upload, bgColor: 'bg-info-50', iconColor: 'text-info-500' };
                      case 'member_added':
                        return { icon: Users, bgColor: 'bg-orange-50', iconColor: 'text-orange-500' };
                      default:
                        return { icon: FileText, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
                    }
                  };

                  const { icon: ActivityIcon, bgColor, iconColor } = getActivityIcon(activity.type);
                  const activityDate = activity.timestamp ? new Date(activity.timestamp) : null;
                  const formattedDate = activityDate ? formatRelativeTime(activity.timestamp) : '';

                  return (
                    <div
                      key={activity.id || index}
                      className={`flex items-center justify-between py-2 px-2 ${
                        index < recentActivity.length - 1 ? 'border-b border-gray-100' : ''
                      } hover:bg-gray-50 rounded transition-colors`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-7 h-7 ${bgColor} rounded-full flex items-center justify-center mr-2.5 flex-shrink-0`}>
                          <ActivityIcon className={`w-3 h-3 ${iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm font-medium text-black truncate">
                            {activity.description || activity.title || 'Activity'}
                          </p>
                          {activity.metadata && (
                            <p className="text-body-sm text-gray-600 truncate">
                              {activity.metadata.itrType || activity.metadata.filename || activity.metadata.name || ''}
                            </p>
                          )}
                        </div>
                      </div>
                      {formattedDate && (
                        <span className="text-body-sm text-gray-500 ml-2 flex-shrink-0">{formattedDate}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-body-md text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
