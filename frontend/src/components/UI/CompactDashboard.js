// =====================================================
// COMPACT DASHBOARD - MOBILE-FIRST DENSE LAYOUT
// Maximum information density with minimal scrolling
// =====================================================

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  Eye,
  Bell,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  Target,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import CompactCard, { CompactCardGrid, CompactStatsCard, CompactProgressCard } from './CompactCard';
import api from '../../services/api';

const CompactDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle missing user gracefully
  if (!user) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Loading...</h2>
          <p className="text-neutral-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['compactDashboard', user?.user_id],
    queryFn: async () => {
      const response = await api.get('/dashboard/compact');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });

  const { data: filingsData } = useQuery({
    queryKey: ['compactFilings', user?.user_id],
    queryFn: async () => {
      const response = await api.get('/dashboard/filings-summary');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 1 * 60 * 1000
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['compactNotifications', user?.user_id],
    queryFn: async () => {
      const response = await api.get('/dashboard/notifications-summary');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Online status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const quickActions = [
    {
      title: 'File New ITR',
      subtitle: 'Start filing process',
      icon: FileText,
      onClick: () => navigate('/itr/start'),
      variant: 'primary',
      badge: 'HOT'
    },
    {
      title: 'Add Member',
      subtitle: 'Add family member',
      icon: Users,
      onClick: () => navigate('/add-members'),
      variant: 'default'
    },
    {
      title: 'View History',
      subtitle: 'Filing history',
      icon: Clock,
      onClick: () => navigate('/filing-history'),
      variant: 'default'
    },
    {
      title: 'Support',
      subtitle: 'Get help',
      icon: Bell,
      onClick: () => navigate('/service-tickets'),
      variant: 'info'
    }
  ];

  const statsCards = [
    {
      title: 'Total Filings',
      value: dashboardData?.totalFilings || '0',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      trend: 'This month'
    },
    {
      title: 'Pending',
      value: dashboardData?.pendingFilings || '0',
      change: '-3',
      changeType: 'negative',
      icon: Clock,
      trend: 'vs last week'
    },
    {
      title: 'Completed',
      value: dashboardData?.completedFilings || '0',
      change: '+8',
      changeType: 'positive',
      icon: CheckCircle,
      trend: 'This month'
    },
    {
      title: 'Savings',
      value: `₹${dashboardData?.totalSavings || '0'}`,
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      trend: 'vs last year'
    }
  ];

  const recentFilings = filingsData?.recentFilings || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
  const notifications = notificationsData?.notifications || [];

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-neutral-200 rounded-xl"></div>
            <div className="h-64 bg-neutral-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-neutral-600 mt-1">
            Here's your tax filing overview
          </p>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isOnline 
              ? 'bg-success-100 text-success-700' 
              : 'bg-error-100 text-error-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-success-500' : 'bg-error-500'
            }`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              <Bell className="w-3 h-3" />
              {notifications.length} new
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <CompactCardGrid columns={{ sm: 2, md: 4, lg: 4 }}>
          {quickActions.map((action, index) => (
            <CompactCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              onClick={action.onClick}
              variant={action.variant}
              badge={action.badge}
              size="sm"
            />
          ))}
        </CompactCardGrid>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Overview</h2>
        <CompactCardGrid columns={{ sm: 2, md: 4, lg: 4 }}>
          {statsCards.map((stat, index) => (
            <CompactStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              trend={stat.trend}
              onClick={() => navigate('/filing-history')}
            />
          ))}
        </CompactCardGrid>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Filings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Filings</h2>
            <button 
              onClick={() => navigate('/filing-history')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentFilings.length > 0 ? (
              recentFilings.slice(0, 5).map((filing, index) => (
                <CompactCard
                  key={index}
                  title={`ITR-${filing.form_type} - ${filing.assessment_year}`}
                  subtitle={filing.status}
                  value={filing.amount ? `₹${filing.amount}` : null}
                  status={filing.status === 'completed' ? 'success' : filing.status === 'pending' ? 'warning' : 'info'}
                  onClick={() => navigate(`/filing-history/${filing.id}`)}
                  size="sm"
                  metadata={[
                    filing.filing_date,
                    filing.assessment_year
                  ]}
                />
              ))
            ) : (
              <CompactCard
                title="No filings yet"
                subtitle="Start your first ITR filing"
                icon={FileText}
                onClick={() => navigate('/itr/start')}
                variant="info"
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Deadlines</h3>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                  <CompactCard
                    key={index}
                    title={deadline.title}
                    subtitle={deadline.description}
                    value={deadline.days_left ? `${deadline.days_left} days` : null}
                    status={deadline.days_left <= 7 ? 'error' : deadline.days_left <= 30 ? 'warning' : 'info'}
                    icon={Calendar}
                    size="sm"
                    metadata={[deadline.date]}
                  />
                ))
              ) : (
                <CompactCard
                  title="No upcoming deadlines"
                  subtitle="All caught up!"
                  icon={CheckCircle}
                  variant="success"
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification, index) => (
                  <CompactCard
                    key={index}
                    title={notification.title}
                    subtitle={notification.message}
                    status={notification.type}
                    icon={Bell}
                    onClick={() => navigate('/notifications')}
                    size="sm"
                    metadata={[notification.time]}
                  />
                ))
              ) : (
                <CompactCard
                  title="No new notifications"
                  subtitle="You're all set!"
                  icon={Bell}
                  variant="info"
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Progress</h3>
            <div className="space-y-3">
              <CompactProgressCard
                title="Profile Completion"
                progress={dashboardData?.profileProgress || 0}
                total={100}
                status={dashboardData?.profileProgress >= 100 ? 'success' : 'warning'}
                onClick={() => navigate('/financial-profile')}
              />
              <CompactProgressCard
                title="Document Upload"
                progress={dashboardData?.documentProgress || 0}
                total={100}
                status={dashboardData?.documentProgress >= 100 ? 'success' : 'warning'}
                onClick={() => navigate('/documents')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <div className="flex items-center justify-around">
          {quickActions.slice(0, 4).map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center space-y-1 p-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactDashboard;
