import db from "./db";
import { BudgetType, InsertExpsenseType } from "./types";

export const getAllBudgetData = async (): Promise<BudgetType[]> => {
  try {
    const data = await db.select('*').from('budget_monthly_allocation');
    return data;
  } catch (err) {
    console.error('Error fetching budget data:', err);
    throw err;
  }
};

export const insertExpense = async (
  expense: InsertExpsenseType,
): Promise<number> => {
  try {
    const result = await db('budget_monthly_expenses')
      .insert(expense)
      .returning('id');

    return result[0];
  } catch (err) {
    console.error('Error inserting expense:', err);
    throw err;
  }
};