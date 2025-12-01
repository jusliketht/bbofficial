// =====================================================
// DEADLINES FEATURE - BARREL EXPORTS
// =====================================================

// Services
export { deadlinesService } from './services/deadlines.service';

// Hooks
export {
  useDeadlines,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from './hooks/use-deadlines';

// Components
export { default as TaxCalendar } from './components/tax-calendar';
export { default as DeadlineList } from './components/deadline-list';
export { default as DeadlineCard } from './components/deadline-card';
export { default as ReminderSettings } from './components/reminder-settings';

