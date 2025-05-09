// Request Body -> using interfaces
export interface ExpenseRequestBody {
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description?: string;
  date?: string;
}

export type BudgetType = {
  id: string;
  category: string;
  bucketname: string;
  amount: number;
  household: string;
};

export type BudgetTypeWithCurrentAmount = BudgetType & {
  currentamount: number;
};

export type InsertExpenseType = {
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description?: string;
  expensedate?: string;
};

export type UpdateExpenseType = {
  id: string;
  updatedat: string;
  person?: string;
  bucketname?: string;
  vendor?: string;
  amount?: number;
  description?: string;
  expensedate?: string;
};

export type MonthlyExpense = {
  id: string;
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description: string;
  expensedate: string;
};

export type MonthlyExpenseWithTimestamps = MonthlyExpense & {
  createdat: string;
  updatedat: string | null;
  deletedat: string | null;
};

export type AggregatedMonthlyReport = {
  [key: string]: MonthlyExpenseWithTimestamps[];
};

export type InsertResponseId = {
  id: string;
};

export type BucketExpenseMap = Map<string, number>;
