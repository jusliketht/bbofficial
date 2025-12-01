// =====================================================
// NOTIFICATIONS HOOKS
// React Query hooks for notifications
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for notifications
 */
export const notificationKeys = {
  all: ['notifications'],
  lists: (filters, pagination) => [...notificationKeys.all, 'list', filters, pagination],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
};

/**
 * Hook to fetch notifications
 */
export function useNotifications(filters = {}, pagination = {}) {
  return useQuery({
    queryKey: notificationKeys.lists(filters, pagination),
    queryFn: () => notificationsService.getNotifications(filters, pagination),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
      toast.success('Notification marked as read');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
}

/**
 * Hook to mark notification as unread
 */
export function useMarkAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationsService.markAsUnread(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark notification as unread');
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });
}

/**
 * Hook to delete all notifications
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
      toast.success('All notifications deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete all notifications');
    },
  });
}

