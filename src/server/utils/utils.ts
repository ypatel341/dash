import db from './db';

export type BudgetType = {
  id: string;
  category: string;
  bucketName: string;
  amount: number;
  household: string;
};

export const getAllBudgetData = async (): Promise<BudgetType[]> => {
  try {
    const data = await db.select('*').from('budget_monthly_allocation');
    return data;
  } catch (err) {
    console.error('Error fetching budget data:', err);
    throw err;
  }
};
