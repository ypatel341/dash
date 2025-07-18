// Error messages
export const ErrorFetchingBudgetData = 'Error fetching budget data';
export const ErrorInsertingExpense = 'Error inserting expense';

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
