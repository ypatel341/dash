import {
  BudgetType,
  InsertExpenseType,
  InsertResponseId,
  MonthlyExpense,
  UpdateExpenseType,
} from '../utils/types';
import {
  deleteExpense,
  getAllBudgetData,
  getAllMonthlyExpenseByMonth,
  getAllMonthlyExpense as getAllMonthlyExpenseFromDB,
  insertExpense,
  updateExpense,
  simpleSelect
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

export const getAllMonthlyExpensesByMonth = async (
  month: string,
): Promise<MonthlyExpense[]> => {
  // Handle input of year here
  const rawMonthlyData: MonthlyExpense[] =
    await getAllMonthlyExpenseByMonth(month);
  return rawMonthlyData;
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

export const deleteExpenseService = async (id: string): Promise<void> => {
  return await deleteExpense(id);
};

export const updateExpenseService = async (
  expense: UpdateExpenseType,
): Promise<void> => {
  return await updateExpense(expense);
};

export const dbHealthCheckService = async (): Promise<boolean> => {
  return await simpleSelect();
}