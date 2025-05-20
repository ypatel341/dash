import {
  MonthlyExpense,
  BudgetTypeWithCurrentAmount,
  ExpenseRequestBody,
  InsertExpenseType,
  MonthlyExpenseWithTimestamps,
} from '../types';

// Factory for MonthlyExpense
export const createMonthlyExpense = (
  overrides: Partial<MonthlyExpense> = {},
): MonthlyExpense => ({
  id: '1',
  person: 'test',
  vendor: 'test vendor',
  description: 'test description',
  expensedate: '2023-10-01',
  bucketname: 'rent',
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
  bucketname: 'groceries',
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
  bucketname: 'rent',
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
  bucketname: 'groceries',
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
  bucketname: 'groceries',
  vendor: 'Walmart',
  amount: 100,
  description: 'Weekly groceries',
  expensedate: '2021-01-01',
  ...overrides,
});
