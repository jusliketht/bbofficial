// =====================================================
// ADMIN USERS HOOKS
// React Query hooks for admin user management
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '../services/users.service';
import toast from 'react-hot-toast';

/**
 * Get all users with filters
 */
export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminUsersService.getUsers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

/**
 * Get user details
 */
export const useAdminUserDetails = (userId, enabled = true) => {
  return useQuery({
    queryKey: ['adminUserDetails', userId],
    queryFn: () => adminUsersService.getUserDetails(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get user activity log
 */
export const useAdminUserActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: ['adminUserActivity', userId, params],
    queryFn: () => adminUsersService.getUserActivity(userId, params),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get user's filings
 */
export const useAdminUserFilings = (userId, params = {}) => {
  return useQuery({
    queryKey: ['adminUserFilings', userId, params],
    queryFn: () => adminUsersService.getUserFilings(userId, params),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get user's transactions
 */
export const useAdminUserTransactions = (userId, params = {}) => {
  return useQuery({
    queryKey: ['adminUserTransactions', userId, params],
    queryFn: () => adminUsersService.getUserTransactions(userId, params),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Update user profile mutation
 */
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => adminUsersService.updateUser(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('User profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user profile');
    },
  });
};

/**
 * Update user status mutation
 */
export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, reason }) => adminUsersService.updateUserStatus(userId, status, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });
};

/**
 * Activate user mutation
 */
export const useActivateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => adminUsersService.activateUser(userId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('User activated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    },
  });
};

/**
 * Deactivate user mutation
 */
export const useDeactivateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => adminUsersService.deactivateUser(userId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('User deactivated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });
};

/**
 * Suspend user mutation
 */
export const useSuspendAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => adminUsersService.suspendUser(userId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    },
  });
};

/**
 * Reset password mutation
 */
export const useResetAdminUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => adminUsersService.resetPassword(userId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('Password reset token generated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};

/**
 * Invalidate sessions mutation
 */
export const useInvalidateAdminUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => adminUsersService.invalidateSessions(userId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['adminUserDetails', variables.userId]);
      toast.success('All user sessions invalidated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to invalidate sessions');
    },
  });
};

/**
 * Bulk operations mutation
 */
export const useBulkAdminUserOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, operation, data }) => adminUsersService.bulkOperations(userIds, operation, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success(`Bulk ${data.operation} operation completed: ${data.successCount} successful, ${data.errorCount} errors`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk operation');
    },
  });
};

/**
 * Export users mutation
 */
export const useExportAdminUsers = () => {
  return useMutation({
    mutationFn: ({ format, params }) => adminUsersService.exportUsers(format, params),
    onSuccess: (data, variables) => {
      if (variables.format === 'csv') {
        // Create download link for CSV
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Users exported successfully');
      } else {
        toast.success('Users exported successfully');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export users');
    },
  });
};

