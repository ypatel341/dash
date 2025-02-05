import { calculateBucketExpenses, validateExpense, validateInputBucket } from '../utils/utils';
import {
  BudgetType,
  MonthlyExpense,
  BudgetTypeWithCurrentAmount,
  ExpenseRequestBody,
  InsertExpsenseType,
} from '../utils/types';
import {
  rawMonthlyData,
  allBudgetData,
  expectedCaclulatedBudgetExpenses,
  rawMonthlyDataTest2,
  expectedTest2,
  allBudgetDataTest2,
} from '../test_data/utilsTestData';
import { ExpenseAmountMinAndMaxError } from '../utils/consts';
import { getAllBudgetData } from '../utils/db-operation-helpers';

jest.mock('../utils/db-operation-helpers', () => ({
  getAllBudgetData: jest.fn(),
}));

describe('calculateBucketExpenses', () => {
  it('should calculate the current amount spent for each bucket', async () => {
    const result = await calculateBucketExpenses(rawMonthlyData, allBudgetData);
    expect(result).toEqual(expectedCaclulatedBudgetExpenses);
  });

  it('should return zero current amount for buckets with no expenses', async () => {
    const result = await calculateBucketExpenses(rawMonthlyDataTest2, allBudgetDataTest2);
    expect(result).toEqual(expectedTest2);
  });

  it('should handle empty rawMonthlyData', async () => {
    const emptyRawMonthlyData: MonthlyExpense[] = [];
    const expected: BudgetTypeWithCurrentAmount[] = [
      {
        bucketname: 'rent',
        amount: 2000,
        currentamount: 0,
        category: 'housing',
        household: 'household',
        id: '1',
      },
      {
        bucketname: 'groceries',
        amount: 300,
        currentamount: 0,
        category: 'food',
        household: 'household',
        id: '2',
      },
    ];

    const result = await calculateBucketExpenses(emptyRawMonthlyData, allBudgetDataTest2);
    expect(result).toEqual(expected);
  });
});

describe('validateExpense', () => {
  it('should validate and return the expense object', async () => {
    const reqBody: ExpenseRequestBody = {
      person: 'John Doe',
      bucketname: 'groceries',
      vendor: 'Walmart',
      amount: 100,
      description: 'Weekly groceries',
      date: '2021-01-01',
    };

    const expected: InsertExpsenseType = {
      person: 'John Doe',
      bucketname: 'groceries',
      vendor: 'Walmart',
      amount: 100,
      description: 'Weekly groceries',
      expensedate: '2021-01-01',
    };

    const result = await validateExpense(reqBody);
    expect(result).toEqual(expected);
  });

  it('should throw an error if amount is missing or invalid', async () => {
    const reqBody: ExpenseRequestBody = {
      person: 'John Doe',
      bucketname: 'groceries',
      vendor: 'Walmart',
      amount: -100,
      description: 'Weekly groceries',
      date: '2021-01-01',
    };

    await expect(validateExpense(reqBody)).rejects.toThrow(
      ExpenseAmountMinAndMaxError,
    );
  });

  it('should throw an error if required fields are missing', async () => {
    const reqBody: ExpenseRequestBody = {
      person: '',
      bucketname: 'groceries',
      vendor: 'Walmart',
      amount: 100,
      description: 'Weekly groceries',
      date: '2021-01-01',
    };

    await expect(validateExpense(reqBody)).rejects.toThrow(
      'Missing required fields person: , bucketname: groceries, vendor: Walmart',
    );
  });
});

describe('validateInputBucket', () => {
  it('should return true if bucketname is valid', async () => {
    const bucketname = 'groceries';
    const activeBucketNames = [
      { bucketname: 'groceries' },
      { bucketname: 'rent' },
    ];
    (getAllBudgetData as jest.Mock).mockResolvedValue(activeBucketNames);

    const result = await validateInputBucket(bucketname);
    expect(result).toBe(true);
  });

  it('should return false if bucketname is invalid', async () => {
    const bucketname = 'entertainment';
    const activeBucketNames = [
      { bucketname: 'groceries' },
      { bucketname: 'rent' },
    ];
    (getAllBudgetData as jest.Mock).mockResolvedValue(activeBucketNames);

    const result = await validateInputBucket(bucketname);
    expect(result).toBe(false);
  });
});

