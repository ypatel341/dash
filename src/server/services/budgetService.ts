import {
  BudgetType,
  BudgetTypeWithCurrentAmount,
  CurrentYearlyAccumulatedData,
  CurrentYearlyAccumulatedWithAllocation,
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
  simpleSelect,
  getAccumulatedYearlyData,
} from '../utils/db-operation-helpers';
import { calculateBucketExpenses } from '../utils/utils';

export const getAllMonthlyExpense = async (): Promise<MonthlyExpense[]> => {
  return await getAllMonthlyExpenseFromDB();
};

export const getAllBucketExpenses = async (): Promise<
  BudgetTypeWithCurrentAmount[]
> => {
  const rawMonthlyData: MonthlyExpense[] = await getAllMonthlyExpense();
  const allBudgetData: BudgetType[] = await getAllBudgetData();
  return await calculateBucketExpenses(rawMonthlyData, allBudgetData);
};

export const getAllBudgetAllocationData = async (): Promise<BudgetType[]> => {
  const allBudgetData: BudgetType[] = await getAllBudgetData();
  return allBudgetData;
};

export const getAllMonthlyExpensesByMonth = async (
  month: string,
): Promise<MonthlyExpense[]> => {
  const rawMonthlyData: MonthlyExpense[] =
    await getAllMonthlyExpenseByMonth(month);
  return rawMonthlyData;
};

export const getYearlyAccumulatedData = async (
  month: string,
): Promise<CurrentYearlyAccumulatedWithAllocation[]> => {
  const accumulatedYearlyData: CurrentYearlyAccumulatedData[] =
    await getAccumulatedYearlyData(month);
  const monthlyAllocatedData: BudgetType[] = await getAllBudgetData();

  accumulatedYearlyData.forEach((data) => {
    data.yearlyAccumulated = parseFloat(data.yearlyAccumulated.toFixed(2));
  });

  const accumulatedYearlyDataWithAllocation: CurrentYearlyAccumulatedWithAllocation[] =
    accumulatedYearlyData.map((data) => ({
      ...data,
      yearlyAllocated: 0, // Default value
    }));

  accumulatedYearlyDataWithAllocation.forEach((data) => {
    const monthlyAllocation = monthlyAllocatedData.find(
      (allocation) => allocation.bucketname === data.bucketname,
    );
    if (monthlyAllocation) {
      data.yearlyAllocated = monthlyAllocation.amount * 12;
    }
  });

  return accumulatedYearlyDataWithAllocation;
};

export const getBucketExpenses = async (
  bucketname: string,
  YYYYMM?: string,
): Promise<MonthlyExpense[]> => {
  if (YYYYMM) {
    const rawMonthlyData: MonthlyExpense[] =
      await getAllMonthlyExpensesByMonth(YYYYMM);
    return rawMonthlyData.filter(
      (expense) => expense.bucketname === bucketname,
    );
  }
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
};
