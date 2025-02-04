import { ExpenseAmountMinAndMaxError } from './consts';
import logger from './logger';
import {
  InsertExpsenseType,
  ExpenseRequestBody,
  BudgetType,
  MonthlyExpense,
  BucketExpenseMap,
  BudgetTypeWithCurrentAmount,
} from './types';

export const validateExpense = async (
  reqBody: ExpenseRequestBody,
): Promise<InsertExpsenseType> => {
  const { person, bucketname, vendor, amount, description, date } = reqBody;

  if (!amount || amount <= 0 || amount > 10000) {
    throw new Error(ExpenseAmountMinAndMaxError);
  }

  if (!person || !bucketname || !vendor) {
    throw new Error(
      `Missing required fields person: ${person}, bucketname: ${bucketname}, vendor: ${vendor}`,
    );
  }

  const expense: InsertExpsenseType = {
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

  logger.info(`(fx: calculateBucketExpesense): ${bucketExpenseMap}`);

  const budgetTypeWithCurrentAmount: BudgetTypeWithCurrentAmount[] =
    allBudgetData.map((budget) => {
      const currentamount = bucketExpenseMap.get(budget.bucketname) || 0;
      return {
        ...budget,
        currentamount,
      };
    });

  logger.info(`(fx: calculateBucketExpesense): ${budgetTypeWithCurrentAmount}`);

  return budgetTypeWithCurrentAmount;
};
