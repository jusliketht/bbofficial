// =====================================================
// ADMIN ANALYTICS HOOKS
// React Query hooks for admin dashboard & analytics
// =====================================================

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '../services/analytics.service';

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminAnalyticsService.getDashboardStats(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useAdminChartData = (type, params = {}) => {
  return useQuery({
    queryKey: ['adminChartData', type, params],
    queryFn: () => adminAnalyticsService.getChartData(type, params),
    staleTime: 5 * 60 * 1000,
    enabled: !!type,
  });
};

export const useAdminSystemAlerts = () => {
  return useQuery({
    queryKey: ['adminSystemAlerts'],
    queryFn: () => adminAnalyticsService.getSystemAlerts(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useAdminRecentActivity = (params = {}) => {
  return useQuery({
    queryKey: ['adminRecentActivity', params],
    queryFn: () => adminAnalyticsService.getRecentActivity(params),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useAdminUserAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['adminUserAnalytics', params],
    queryFn: () => adminAnalyticsService.getUserAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminRevenueAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['adminRevenueAnalytics', params],
    queryFn: () => adminAnalyticsService.getRevenueAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

