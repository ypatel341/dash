import {
  BudgetType,
  InsertExpenseType,
  InsertResponseId,
  MonthlyExpense,
} from '../utils/types';
import {
  getAllBudgetData,
  getAllMonthlyExpense as getAllMonthlyExpenseFromDB,
  insertExpense,
} from '../utils/db-operation-helpers';
import { calculateBucketExpenses } from '../utils/utils';

export const getAllMonthlyExpense = async (): Promise<MonthlyExpense[]> => {
  return await getAllMonthlyExpenseFromDB();
};

export const getAllBucketExpenses = async () => {
  const rawMonthlyData: MonthlyExpense[] = await getAllMonthlyExpense();
  const allBudgetData: BudgetType[] = await getAllBudgetData();
  return await calculateBucketExpenses(rawMonthlyData, allBudgetData);
};

export const getBucketExpenses = async (
  bucketname: string,
): Promise<MonthlyExpense[]> => {
  const data: MonthlyExpense[] = await getAllMonthlyExpense();
  return data.filter((expense) => expense.bucketname === bucketname);
};

export const insertExpenseService = async (
  expense: InsertExpenseType,
): Promise<InsertResponseId> => {
  return await insertExpense(expense);
};
