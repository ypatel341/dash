import db from '../../config/db';
import logger from './logger';
import {
  BudgetType,
  InsertExpenseType,
  InsertResponseId,
  MonthlyExpense,
  UpdateExpenseType,
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
  expense: InsertExpenseType,
): Promise<InsertResponseId> => {
  let insertObj: InsertExpenseType = {
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

export const getAllMonthlyExpenseByMonth = async(yearMonthDay: string): Promise<MonthlyExpense[]> => {
  try {

      // const startDate = `${month}-01`;

      // // Create a date object for the first day of the next month
      // const nextMonth = new Date(startDate);
      // nextMonth.setMonth(nextMonth.getMonth() + 1);
  
      // // Get the last day of the given month by subtracting one day from the first day of the next month
      // const endDate = new Date(nextMonth);
      // endDate.setDate(endDate.getDate() - 1);
  
      // // Format the end date as YYYY-MM-DD
      // const endDateString = endDate.toISOString().split('T')[0];
    
    // DB format is YYYY-MM-DD
    const startDate = `2025-02-01`;
    const endDate = `2025-02-28`;

    logger.info(`Fetching expenses for start: ${startDate} and end: ${endDate}`);

    const result: MonthlyExpense[] = await db('budget_monthly_expenses')
      .select('*')
      .where('expensedate', '>=', db.raw('?', [startDate]))
      .where('expensedate', '<', db.raw('?::date + INTERVAL \'1 month\'', [endDate]))
      .whereNull('deletedat')
      .orderBy('expensedate', 'desc');

    console.log('result', result);

    logger.info(`Fetched ${result.length} monthly expenses for month: ${yearMonthDay}`);

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData}: ${error}`);
    throw error;
  }
}

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await db('budget_monthly_expenses')
      .where({ id })
      .update({ deletedat: db.fn.now() });

    logger.info(`Deleted expense with id ${id}`);
  } catch (error) {
    logger.error(`${ErrorInsertingExpense} ${error}`);
    throw error;
  }
};

export const updateExpense = async (
  updateExpense: UpdateExpenseType,
): Promise<void> => {
  const { id } = updateExpense;

  try {
    await db('budget_monthly_expenses').where({ id: id }).update(updateExpense);

    logger.info(`Updated expense with id ${updateExpense.id}`);
  } catch (error) {
    logger.error(`${ErrorInsertingExpense} ${error}`);
    throw error;
  }
};
