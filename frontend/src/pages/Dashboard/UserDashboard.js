// =====================================================
// USER DASHBOARD COMPONENT - ENTERPRISE GRADE
// Complete integration with backend APIs
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useFilingContext } from '../../contexts/FilingContext';
import userDashboardService from '../../services/userDashboardService';
import memberService from '../../services/memberService';
import toast from 'react-hot-toast';
import DocumentUpload from '../../components/Documents/DocumentUpload';
import SessionManagement from '../../components/SessionManagement';

const UserDashboard = () => {
  const { user } = useAuth();
  const { getUserDrafts, getUserFilings } = useFilingContext();
  const navigate = useNavigate();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [
        dashboardResponse,
        membersResponse,
        notificationsResponse
      ] = await Promise.all([
        userDashboardService.getDashboardData(),
        memberService.getMembers(),
        userDashboardService.getUserNotifications()
      ]);

      setDashboardData(dashboardResponse.data);
      setMembers(membersResponse.data || []);
      setNotifications(notificationsResponse.data.notifications || []);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback to mock data if API fails
      setDashboardData({
        user: { fullName: user?.fullName, lastLoginAt: new Date() },
        filingSummary: { draftCount: 0, filingStats: [] },
        memberSummary: { memberCount: 0 },
        documentSummary: { totalDocuments: 0, totalStorage: 0, verifiedDocuments: 0 },
        ticketSummary: { openTickets: 0 },
        quickActions: [
          { label: 'Start New Filing', action: 'start_new_filing', icon: 'plus' },
          { label: 'Upload Document', action: 'upload_document', icon: 'upload' }
        ],
        recentActivity: { activities: [] }
      });
      setMembers([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [getUserDrafts]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'continue_filing':
        navigate('/itr/filing');
        break;
      case 'start_new_filing':
        navigate('/itr/filing');
        break;
      case 'upload_document':
        navigate('/documents/upload');
        break;
      case 'view_tickets':
        navigate('/support/tickets');
        break;
      case 'manage_members':
        navigate('/members');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      draft: 'blue',
      submitted: 'green',
      acknowledged: 'green',
      processed: 'green',
      rejected: 'red',
      pending: 'yellow',
      in_progress: 'blue',
      active: 'green',
      inactive: 'gray',
      suspended: 'red'
    };
    return statusColors[status] || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  if (loading) {
    return (
      <div className="user-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.fullName || 'User'}!</h1>
            <p className="last-login">
              Last login: {formatDate(dashboardData?.user?.lastLoginAt)}
            </p>
          </div>
          <div className="header-actions">
            <Button
              variant="secondary"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/itr/filing')}
            >
              Start New Filing
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="quick-stats">
        <Card className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{dashboardData?.filingSummary?.draftCount || 0}</h3>
            <p>Draft Filings</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{dashboardData?.filingSummary?.filingStats?.reduce((sum, stat) => sum + (stat.submittedFilings || 0), 0) || 0}</h3>
            <p>Submitted Filings</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{dashboardData?.memberSummary?.memberCount || 0}</h3>
            <p>Family Members</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{dashboardData?.documentSummary?.totalDocuments || 0}</h3>
            <p>Documents</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>{dashboardData?.ticketSummary?.openTickets || 0}</h3>
            <p>Open Tickets</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{getUnreadNotificationsCount()}</h3>
            <p>Unread Notifications</p>
          </div>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'filings' ? 'active' : ''}`}
          onClick={() => setActiveTab('filings')}
        >
          Filings ({dashboardData?.filingSummary?.filingStats?.reduce((sum, stat) => sum + (stat.totalFilings || 0), 0) || 0})
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({dashboardData?.documentSummary?.totalDocuments || 0})
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications ({getUnreadNotificationsCount()})
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Quick Actions */}
            <Card className="quick-actions-card">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                {dashboardData?.quickActions?.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    onClick={() => handleQuickAction(action.action)}
                    className="quick-action-btn"
                  >
                    <span className="action-icon">{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Filing Summary */}
            <Card className="filing-summary-card">
              <h2>Filing Summary</h2>
              <div className="filing-stats">
                {dashboardData?.filingSummary?.filingStats?.map((stat, index) => (
                  <div key={index} className="filing-stat">
                    <h3>{stat.itrType}</h3>
                    <div className="stat-details">
                      <span>Total: {stat.totalFilings}</span>
                      <span>Submitted: {stat.submittedFilings}</span>
                      <span>Acknowledged: {stat.acknowledgedFilings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="recent-activity-card">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {dashboardData?.recentActivity?.activities?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'CREATE_FILING' ? '📄' : 
                       activity.action === 'UPDATE_PROFILE' ? '👤' : 
                       activity.action === 'UPLOAD_DOCUMENT' ? '📁' : '🔍'}
                    </div>
                    <div className="activity-content">
                      <p>{activity.description}</p>
                      <span className="activity-time">{formatDate(activity.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Filings Tab */}
        {activeTab === 'filings' && (
          <div className="filings-tab">
            <div className="tab-header">
              <h2>Your Filings</h2>
              <Button
                variant="primary"
                onClick={() => navigate('/itr/filing')}
              >
                Start New Filing
              </Button>
            </div>
            
            {dashboardData?.filingSummary?.filingStats?.length > 0 ? (
              <div className="filings-grid">
                {dashboardData.filingSummary.filingStats.map((stat, index) => (
                  <Card key={index} className="filing-stat-card">
                    <h3>{stat.itrType}</h3>
                    <div className="stat-numbers">
                      <div className="stat-item">
                        <span className="number">{stat.totalFilings}</span>
                        <span className="label">Total</span>
                      </div>
                      <div className="stat-item">
                        <span className="number">{stat.submittedFilings}</span>
                        <span className="label">Submitted</span>
                      </div>
                      <div className="stat-item">
                        <span className="number">{stat.acknowledgedFilings}</span>
                        <span className="label">Acknowledged</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/itr/filing')}
                    >
                      File {stat.itrType}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Filings Yet</h3>
                <p>Start your first ITR filing to get started</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/itr/filing')}
                >
                  Start Filing
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="members-tab">
            <div className="tab-header">
              <h2>Family Members</h2>
              <Button
                variant="primary"
                onClick={() => navigate('/members')}
              >
                Manage Members
              </Button>
            </div>
            
            {members.length > 0 ? (
              <div className="members-grid">
                {members.map((member) => (
                  <Card key={member.id} className="member-card">
                    <div className="member-header">
                      <h3>{member.fullName}</h3>
                      <StatusBadge
                        status={member.status}
                        color={getStatusColor(member.status)}
                      />
                    </div>
                    <div className="member-details">
                      <p><strong>PAN:</strong> {member.pan}</p>
                      <p><strong>Relationship:</strong> {member.relationshipLabel}</p>
                      <p><strong>Added:</strong> {formatDate(member.createdAt)}</p>
                    </div>
                    <div className="member-actions">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/itr/filing?member=${member.id}`)}
                      >
                        File ITR
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Family Members</h3>
                <p>Add family members to file ITR for them</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/members')}
                >
                  Add Member
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="tab-header">
              <h2>Your Documents</h2>
              <Button
                variant="primary"
                onClick={() => navigate('/documents/upload')}
              >
                Upload Document
              </Button>
            </div>
            
            <div className="document-stats">
              <Card className="stat-card">
                <h3>{dashboardData?.documentSummary?.totalDocuments || 0}</h3>
                <p>Total Documents</p>
              </Card>
              <Card className="stat-card">
                <h3>{formatFileSize(dashboardData?.documentSummary?.totalStorage || 0)}</h3>
                <p>Storage Used</p>
              </Card>
              <Card className="stat-card">
                <h3>{dashboardData?.documentSummary?.verifiedDocuments || 0}</h3>
                <p>Verified Documents</p>
              </Card>
            </div>
            
            <DocumentUpload
              filingId={null}
              memberId={null}
              onDocumentUpload={(results) => {
                // Refresh dashboard data when documents are uploaded
                loadDashboardData();
              }}
              onDocumentDelete={(document) => {
                // Refresh dashboard data when documents are deleted
                loadDashboardData();
              }}
            />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="tab-header">
              <h2>Notifications</h2>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await userDashboardService.markAllNotificationsAsRead();
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    toast.success('All notifications marked as read');
                  } catch (error) {
                    toast.error('Failed to mark notifications as read');
                  }
                }}
              >
                Mark All Read
              </Button>
            </div>
            
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <h4>{notification.message}</h4>
                      <p className="notification-time">{formatDate(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={async () => {
                          try {
                            await userDashboardService.markNotificationAsRead(notification.id);
                            setNotifications(prev => 
                              prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                            );
                            toast.success('Notification marked as read');
                          } catch (error) {
                            toast.error('Failed to mark notification as read');
                          }
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Notifications</h3>
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="tab-header">
              <h2>Security Settings</h2>
            </div>
            <SessionManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;