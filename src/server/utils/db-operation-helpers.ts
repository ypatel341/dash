import db from '../../config/db';
import logger from './logger';
import {
  BudgetType,
  CurrentYearlyAccumulatedData,
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

  if (expense.expensable) {
    const expensableResult = await db('reimbursable_expenses')
      .insert({
        expensable_id: db.raw('gen_random_uuid()'),
        company: 'test company',
        reimbursable: true,
        description: 'some description',
      })
      .returning('expensable_id');

    const expensable_id = expensableResult[0].expensable_id;

    insertObj = {
      ...insertObj,
      expensable: expensable_id, // Use the extracted UUID
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
    logger.error(`Error inserting expense: ${err}`);
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

export const getAllMonthlyExpenseByMonth = async (
  yearMonth: string,
): Promise<MonthlyExpense[]> => {
  try {
    const yearMonthDay = `${yearMonth}-01`;

    logger.info(`Fetching expenses for the month: ${yearMonthDay}`);

    const result: MonthlyExpense[] = await db('budget_monthly_expenses')
      .select('*')
      .where('expensedate', '>=', db.raw('?', [yearMonthDay]))
      .where(
        'expensedate',
        '<',
        db.raw("?::date + INTERVAL '1 month'", [yearMonthDay]),
      )
      .whereNull('deletedat')
      .orderBy('expensedate', 'desc');

    logger.info(
      `Fetched ${result.length} monthly expenses for month: ${yearMonth}`,
    );

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData}: ${error}`);
    throw error;
  }
};

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

export const simpleSelect = async (): Promise<boolean> => {
  try {
    const response = await db.raw('select * from budget_monthly_allocation');
    logger.info(`Simple select response: ${JSON.stringify(response)}`);
    return true;
  } catch (error) {
    logger.error(`Error checking DB health: ${error}`);
    throw error;
  }
};

export const getAccumulatedYearlyData = async (
  month: string,
): Promise<CurrentYearlyAccumulatedData[]> => {
  const year = month.split('-')[0];

  try {
    const result = await db('budget_monthly_expenses')
      .select('bucketname')
      .sum('amount as yearlyAccumulated')
      .where('expensedate', '>=', db.raw(`DATE '${year}-01-01'`))
      .where(
        'expensedate',
        '<',
        db.raw(`DATE '${month}-01' + INTERVAL '1 month'`),
      )
      .whereNull('deletedat')
      .groupBy('bucketname');

    logger.info(`Fetched accumulated yearly data for month: ${month}`);

    return result as CurrentYearlyAccumulatedData[];
  } catch (error) {
    logger.error(`Error fetching accumulated yearly data: ${error}`);
    throw error;
  }
};
