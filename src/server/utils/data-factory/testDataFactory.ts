import { BudgetData } from '../../../app/budgeting-page/types/BudgetCategoryTypes';
import {
  MonthlyExpense,
  BudgetTypeWithCurrentAmount,
  ExpenseRequestBody,
  InsertExpenseType,
  MonthlyExpenseWithTimestamps,
  AggregatedMonthlyReport,
  MonthlyExpensesWithBucketSummary,
} from '../types';
import { generateRandomBucket, generateRandomPerson } from './utils';

// Factory for MonthlyExpense
export const createMonthlyExpense = (
  overrides: Partial<MonthlyExpense> = {},
): MonthlyExpense => ({
  id: '1',
  person: generateRandomPerson(),
  vendor: 'test',
  description: 'test',
  expensedate: '2023-10-01',
  bucketname: generateRandomBucket(),
  amount: 1000,
  ...overrides, // Allow overriding default values
});

// INFO: the factory above can be combined with the one below
// But for now, we keep them separate for clarity
// Factory for MonthlyExpenseWithTimestamps
export const createMonthlyExpenseWithTimestamps = (
  overrides: Partial<MonthlyExpenseWithTimestamps> = {},
): MonthlyExpenseWithTimestamps => ({
  id: '1',
  vendor: 'Walmart',
  person: 'John Doe',
  description: 'Weekly groceries',
  bucketname: generateRandomBucket(),
  amount: 100,
  expensedate: '2023-10-01T12:00:00Z',
  createdat: '2023-10-01T12:00:00Z',
  updatedat: null,
  deletedat: null,
  ...overrides,
});

// Factory for BudgetTypeWithCurrentAmount
export const createBudgetTypeWithCurrentAmount = (
  overrides: Partial<BudgetTypeWithCurrentAmount> = {},
): BudgetTypeWithCurrentAmount => ({
  id: '1',
  bucketname: generateRandomBucket(),
  amount: 2000,
  currentamount: 0,
  category: 'housing',
  household: 'household',
  ...overrides,
});

// Factory for ExpenseRequestBody
export const createExpenseRequestBody = (
  overrides: Partial<ExpenseRequestBody> = {},
): ExpenseRequestBody => ({
  person: 'John Doe',
  bucketname: generateRandomBucket(),
  vendor: 'Walmart',
  amount: 100,
  description: 'Weekly groceries',
  date: '2021-01-01',
  ...overrides,
});

// TODO: Consider combining the types InsertExpenseType and MonthlyExpense
// Factory for InsertExpenseType
export const createInsertExpense = (
  overrides: Partial<InsertExpenseType> = {},
): InsertExpenseType => ({
  person: 'John Doe',
  bucketname: generateRandomBucket(),
  vendor: 'Walmart',
  amount: 100,
  description: 'Weekly groceries',
  expensedate: '2021-01-01',
  ...overrides,
});

export const createAggregatedMonthlyReport = (
  overrides: Record<string, Partial<MonthlyExpensesWithBucketSummary>> = {},
): AggregatedMonthlyReport => {
  const defaultReport: MonthlyExpensesWithBucketSummary = {
    monthlyExpenseTotal: 0,
    monthlyBucketAllocation: 0,
    monthlyExpenses: [createMonthlyExpenseWithTimestamps()],
  };

  const report: AggregatedMonthlyReport = { buckets: {} };

  for (const key in overrides) {
    report.buckets[key] = { ...defaultReport, ...overrides[key] };
  }

  return report;
};

export const createBucketBudgetData = (
  overrides: Partial<BudgetData> = {},
): BudgetData => ({
  id: '1',
  category: 'test',
  amount: 0,
  bucketname: generateRandomBucket(),
  household: 'test',
  currentamount: 0,
  ...overrides,
});
