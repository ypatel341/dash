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
  bucketName: string;
  amount: number;
  household: string;
};

export type InsertExpsenseType = {
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description?: string;
  expensedate?: string;
};
