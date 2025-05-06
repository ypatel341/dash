import dayjs from 'dayjs';
import {
  BudgetData,
  ExpenseData,
  MonthlyExpense,
  CurrentTotalAmount,
} from '../types/BudgetCategoryTypes';

export const transformBucketName = (bucketname: string): string => {
  const transformations: { [key: string]: string } = {
    rent: 'Rent',
    electric: 'Electric',
    gas: 'Gas',
    groceries: 'Groceries',
    house_supplies: 'Home Supplies',
    internet: 'Internet',
    parcel: 'Parcel Pending',
    therapy: 'Therapy',
    clothes: 'Clothes',
    netflix: 'Netflix',
    spotify: 'Spotify',
    vacation: 'Vacation',
    date_night: 'Date Night',
    going_out_yogi: 'Going Out',
    yogi_activities: 'Activities',
    gifts: 'Gifts',
    savings_chase_2112: 'Savings',
  };

  return transformations[bucketname] || `Error transforming: ${bucketname}`;
};

export const transformCategoryName = (category: string): string => {
  const transformations: { [key: string]: string } = {
    needs: 'Needs',
    wants: 'Wants',
    savings: 'Savings',
  };

  return transformations[category] || `Error transforming: ${category}`;
};

export const validateExpense = (data: ExpenseData): string | null => {
  const { person, bucketname, vendor, amount } = data;

  if (!person || !bucketname || !vendor || !amount) {
    return 'All fields are required';
  }

  if (isNaN(amount)) {
    return 'Amount must be a number';
  }

  return null;
};

// Date Functions
const formatTimestamptzToMMDDYYYY = (date: string): string => {
  return dayjs(date).format('MM/DD/YYYY');
};
const today = dayjs();
const nextMonth = today.add(1, 'month');

export const formattedDate = nextMonth.format('YYYY-MM-DD');

export const formatMonthlyExpensesToBucketExpenses = async (
  monthlyExpenses: MonthlyExpense[],
  existingBudgetData: BudgetData[],
): Promise<BudgetData[]> => {
  // Accumulate amounts per bucket using reduce
  const bucketMap = monthlyExpenses.reduce((map, { bucketname, amount }) => {
    const current = map.get(bucketname) || 0;
    map.set(bucketname, current + amount);
    return map;
  }, new Map<string, number>());

  const updatedBudgetData = existingBudgetData.map((bucket) => {
    const updatedAmount = bucketMap.get(bucket.bucketname);
    return {
      ...bucket,
      currentamount: updatedAmount !== undefined ? updatedAmount : 0,
    };
  });

  return updatedBudgetData;
};

export const formatMonthlyExpensesExpenseDate = async (
  expense: MonthlyExpense[],
) => {
  return expense.map((expense) => ({
    ...expense,
    expensedate: formatTimestamptzToMMDDYYYY(expense.expensedate),
  }));
};

export const calculateSurplus = async (budgetData: BudgetData[]) => {
  const currentMonthlyUsage = budgetData.reduce(
    (acc, item) => acc + item.currentamount,
    0,
  );
  const monthlyTotalBudget = budgetData.reduce(
    (acc, item) => acc + item.amount,
    0,
  );
  const monthlySurplus = monthlyTotalBudget - currentMonthlyUsage;

  const currentTotalAmount: CurrentTotalAmount = {
    monthlyTotalBudget,
    currentMonthlyUsage,
    monthlySurplus,
  };

  return currentTotalAmount;
};

export const formatSubValue = (subValue: number | undefined): string => {
  if (subValue) {
    return `: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subValue)}`;
  }
  return '';
};

export const getMonthFromDate = (date: Date): string => {
  return dayjs(date).format('YYYY-MM');
};

export const isCurrentMonth = (date: Date): boolean => {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}