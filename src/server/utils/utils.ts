import { ExpenseAmountMinAndMaxError } from './consts';
import { InsertExpsenseType, ExpenseRequestBody } from './types';

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
