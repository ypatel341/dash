import { ExpenseAmountMinAndMaxError } from './consts';
import { getAllBudgetData } from './db-operation-helpers';
import logger from './logger';
import {
  InsertExpenseType,
  ExpenseRequestBody,
  BudgetType,
  MonthlyExpense,
  BucketExpenseMap,
  BudgetTypeWithCurrentAmount,
  AggregatedMonthlyReport,
  MonthlyExpenseWithTimestamps,
} from './types';

export const validateExpense = async (
  reqBody: ExpenseRequestBody,
): Promise<InsertExpenseType> => {
  const { person, bucketname, vendor, amount, description, date } = reqBody;

  if (!amount || amount <= 0 || amount > 10000) {
    throw new Error(ExpenseAmountMinAndMaxError);
  }

  if (!person || !bucketname || !vendor) {
    throw new Error(
      `Missing required fields person: ${person}, bucketname: ${bucketname}, vendor: ${vendor}`,
    );
  }

  const expense: InsertExpenseType = {
    person,
    bucketname,
    vendor,
    amount,
    description,
  };

  if (date) {
    expense.expensedate = date;
  }

  return expense;
};

export const calculateBucketExpenses = async (
  rawMonthlyData: MonthlyExpense[],
  allBudgetData: BudgetType[],
): Promise<BudgetTypeWithCurrentAmount[]> => {
  const bucketExpenseMap: BucketExpenseMap = new Map();

  rawMonthlyData.forEach((expense) => {
    const currentAmount = bucketExpenseMap.get(expense.bucketname) || 0;
    bucketExpenseMap.set(expense.bucketname, currentAmount + expense.amount);
  });

  logger.info(`(fx: calculateBucketExpense): ${bucketExpenseMap}`);

  const budgetTypeWithCurrentAmount: BudgetTypeWithCurrentAmount[] =
    allBudgetData.map((budget) => {
      const currentamount = bucketExpenseMap.get(budget.bucketname) || 0;
      return {
        ...budget,
        currentamount,
      };
    });

  logger.info(`(fx: calculateBucketExpense): ${budgetTypeWithCurrentAmount}`);

  return budgetTypeWithCurrentAmount;
};

export const validateInputBucket = async (
  bucketname: string,
): Promise<boolean> => {
  const activeBucketNames = await getAllBudgetData();
  const bucketNames = activeBucketNames.map((bucket) => bucket.bucketname);
  return bucketNames.includes(bucketname);
};

// Test Helpers
export const getCurrentYearMonth = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
  return `${year}-${month}`;
};

export const isValidDate = (dateString: string | undefined): boolean => {
  return !!dateString && !/^\d{4}-\d{2}$/.test(dateString as string);
};

export const formatMonthlyExpensesToBucketExpenses = async (
  monthlyExpenses: MonthlyExpenseWithTimestamps[],
): Promise<AggregatedMonthlyReport> => {
  const formattedResponse: MonthlyExpenseWithTimestamps[] = monthlyExpenses.map(
    (expense) => ({
      ...expense,
      expensedate: new Date(expense.expensedate).toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }),
  );

  const aggregatedMonthlyReport: AggregatedMonthlyReport = {
    buckets: {},
  };

  formattedResponse.forEach((expense) => {
    const { bucketname } = expense;

    if (!aggregatedMonthlyReport.buckets[bucketname]) {
      aggregatedMonthlyReport.buckets[bucketname] = {
        monthlyExpenseTotal: 0,
        monthlyBucketAllocation: 0,
        monthlyExpenses: [],
      };
    }

    aggregatedMonthlyReport.buckets[bucketname].monthlyExpenses.push(expense);
  });

  Object.keys(aggregatedMonthlyReport.buckets).forEach((bucketname) => {
    const expenses =
      aggregatedMonthlyReport.buckets[bucketname].monthlyExpenses;
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    aggregatedMonthlyReport.buckets[bucketname].monthlyExpenseTotal = total;
  });

  return aggregatedMonthlyReport;
};
