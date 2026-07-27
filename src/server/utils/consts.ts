// Error messages
export const ErrorFetchingBudgetData = 'Error fetching budget data';
export const ErrorInsertingExpense = 'Error inserting expense';
export const ErrorFetchingDailyWord = 'Error fetching daily word';
export const ErrorInsertingDailyWord = 'Error inserting daily word';

// PDF generation constants
export const monthlyBudgetReportCSS = 'monthlyReportStyleSheet.css';
export const monthlyBudgetReportTemplate = 'monthlyBudgetSummary.mustache';
export const reportTitle = 'monthly-report';

// Validation rules for budget expenses
export const VALIDATION_RULES = {
  AMOUNT: {
    MIN: 0,
    MAX: 10000,
  },
} as const;

// Task error messages
export const ErrorFetchingTask = 'Error fetching task data';
export const ErrorInsertingTask = 'Error inserting task';
export const ErrorUpdatingTask = 'Error updating task';
export const ErrorDeletingTask = 'Error deleting task';
export const ErrorFetchingTaskCategories = 'Error fetching task categories';
export const ErrorInsertingTaskCategory = 'Error inserting task category';
export const ErrorUpdatingTaskCategory = 'Error updating task category';

// Task valid values
export const VALID_TASK_KINDS = ['event', 'deadline', 'activity'] as const;
export const VALID_TASK_MODALITIES = ['physical', 'virtual', 'none'] as const;
export const VALID_TASK_TIME_MODES = ['timed', 'all_day', 'date_only'] as const;
export const VALID_TASK_STATUSES = [
  'planned',
  'completed',
  'skipped',
  'canceled',
] as const;
export const VALID_ASSIGNED_TO = ['Yogi', 'Riddhi', 'Both'] as const;
export const VALID_SERIES_STATUSES = [
  'active',
  'paused',
  'ended',
  'archived',
] as const;

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  planned: ['completed', 'skipped', 'canceled'],
  completed: [],
  skipped: ['planned'],
  canceled: [],
};
