import { ExpenseData } from '../types/BudgetCategoryTypes';

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

export const transformCategorytName = (category: string): string => {
  const transformations: { [key: string]: string } = {
    needs: 'Needs',
    wants: 'Wants',
    savings: 'Savings',
  };

  return transformations[category] || `Error transforming: ${category}`;
};

export const validateExpense = (data: ExpenseData): string | null => {
  const { person, bucketname, vendor, amount, description } = data;

  if (!person || !bucketname || !vendor || !amount || !description) {
    return 'All fields are required';
  }

  if (isNaN(amount)) {
    return 'Amount must be a number';
  }

  return null;
};
