import db from './db';
import { BudgetType, InsertExpsenseType } from './types';

export const getAllBudgetData = async (): Promise<BudgetType[]> => {
  try {
    const result = await db('budget_monthly_allocation').select('*');

    return result;
  } catch (err) {
    console.error('Error fetching budget data:', err);
    throw err;
  }
};

export const insertExpense = async (
  expense: InsertExpsenseType,
): Promise<number> => {
  try {
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

    const result = await db('budget_monthly_expenses')
      .insert(insertObj)
      .returning('id');
    return result[0];
  } catch (err) {
    console.error('Error inserting expense:', err);
    throw err;
  }
};
