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

export type MonthlyExpense = {
  id: string;
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description: string;
  expensedate: string;
};

export type InsertResponseId = {
  id: string;
};

export type BucketExpenseMap = Map<string, number>;
