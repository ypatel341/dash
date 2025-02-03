import db from './db';
import logger from './logger';
import {
  BudgetType,
  InsertExpsenseType,
  InsertResponseId,
  MonthlyExpense,
} from './types';
import { ErrorFetchingBudgetData, ErrorInsertingExpense } from './consts';

export const getAllBudgetData = async (): Promise<BudgetType[]> => {
  try {
    const result = await db('budget_monthly_allocation').select('*');
    logger.info(`Fetching all budget data ${result}`);

    return result;
  } catch (err) {
    logger.error(`${ErrorFetchingBudgetData} ${err}`);
    throw err;
  }
};

export const insertExpense = async (
  expense: InsertExpsenseType,
): Promise<InsertResponseId> => {
  // move this out of the try catch
  let insertObj: InsertExpsenseType = {
    person: expense.person,
    bucketname: expense.bucketname,
    vendor: expense.vendor,
    amount: expense.amount,
    description: expense.description,
  };

  if (expense.expensedate) {
    insertObj = {
      ...insertObj,
      expensedate: expense.expensedate,
    };
  }
  try {
    const result = await db('budget_monthly_expenses')
      .insert(insertObj)
      .returning('id')
      .whereNull('deletedat');

    logger.info(`Inserted expense ${result[0]}`);

    return result[0];
  } catch (err) {
    logger.error(`${ErrorInsertingExpense} ${err}`);
    throw err;
  }
};

export const getAllMonthlyExpense = async (): Promise<MonthlyExpense[]> => {
  try {
    const result: MonthlyExpense[] = await db('budget_monthly_expenses')
      .select('*')
      .where('expensedate', '>=', db.raw("date_trunc('month', CURRENT_DATE)"))
      .where(
        'expensedate',
        '<',
        db.raw("date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'"),
      )
      .whereNull('deletedat')
      .orderBy('expensedate', 'desc');

    logger.info(`Fetching all monthly expenses ${result}`);

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData} ${error}`);
    throw error;
  }
};
