// =====================================================
// USE DEADLINES HOOK
// React Query hooks for deadlines and reminders
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deadlinesService } from '../services/deadlines.service';
import toast from 'react-hot-toast';

export const deadlinesKeys = {
  all: ['deadlines'],
  list: (options) => [...deadlinesKeys.all, 'list', options],
};

/**
 * Hook for fetching deadlines
 */
export function useDeadlines(options = {}) {
  return useQuery({
    queryKey: deadlinesKeys.list(options),
    queryFn: () => deadlinesService.getDeadlines(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deadlineId, reminderDays }) =>
      deadlinesService.createReminder(deadlineId, reminderDays),
    onSuccess: () => {
      queryClient.invalidateQueries(deadlinesKeys.all);
      toast.success('Reminder created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create reminder');
    },
  });
}

/**
 * Hook for updating reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reminderId, updateData }) =>
      deadlinesService.updateReminder(reminderId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(deadlinesKeys.all);
      toast.success('Reminder updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update reminder');
    },
  });
}

/**
 * Hook for deleting reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId) => deadlinesService.deleteReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries(deadlinesKeys.all);
      toast.success('Reminder deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete reminder');
    },
  });
}

