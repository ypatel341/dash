import { ExpenseAmountMinAndMaxError } from '../server/utils/consts';
import { getAllBudgetData } from '../server/utils/db-operation-helpers';
import {
  MonthlyExpense,
  BudgetTypeWithCurrentAmount,
  ExpenseRequestBody,
  InsertExpenseType,
  MonthlyExpenseWithTimestamps,
} from '../server/utils/types';
import {
  calculateBucketExpenses,
  formatMonthlyExpensesToBucketExpenses,
  validateExpense,
  validateInputBucket,
} from '../server/utils/utils';
import {
  rawMonthlyData,
  allBudgetData,
  expectedCalculatedBudgetExpenses,
  rawMonthlyDataTest2,
  allBudgetDataTest2,
  expectedTest2,
} from '../test_data/utilsTestData';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getAllBudgetData: jest.fn(),
}));

describe('calculateBucketExpenses', () => {
  it('should calculate the current amount spent for each bucket', async () => {
    const result = await calculateBucketExpenses(rawMonthlyData, allBudgetData);
    expect(result).toEqual(expectedCalculatedBudgetExpenses);
  });

  it('should return zero current amount for buckets with no expenses', async () => {
    const result = await calculateBucketExpenses(
      rawMonthlyDataTest2,
      allBudgetDataTest2,
    );
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

    const result = await calculateBucketExpenses(
      emptyRawMonthlyData,
      allBudgetDataTest2,
    );
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

    const expected: InsertExpenseType = {
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

  describe('formatMonthlyExpensesToBucketExpenses', () => {
    it('should format and aggregate monthly expenses correctly', async () => {
      const monthlyExpenses = [
        {
          id: '1',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'groceries',
          amount: 100,
          expensedate: '2023-10-01T12:00:00Z',
          createdat: '2023-10-01T12:00:00Z',
          updatedat: null,
          deletedat: null,
        },
        {
          id: '2',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'groceries',
          amount: 50,
          expensedate: '2023-10-02T12:00:00Z',
          createdat: '2023-10-02T12:00:00Z',
          updatedat: null,
          deletedat: null,
        },
        {
          id: '3',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'rent',
          amount: 2000,
          expensedate: '2023-10-01T12:00:00Z',
          createdat: '2023-10-01T12:00:00Z',
          updatedat: null,
          deletedat: null,
        },
      ];

      const expected = {
        groceries: {
          monthlyExpenseTotal: 150,
          monthlyBucketAllocation: 0,
          monthlyExpenses: [
            {
              id: '1',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'groceries',
              amount: 100,
              expensedate: '2023-10-01',
              createdat: '2023-10-01T12:00:00Z',
              updatedat: null,
              deletedat: null,
            },
            {
              id: '2',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'groceries',
              amount: 50,
              expensedate: '2023-10-02',
              createdat: '2023-10-02T12:00:00Z',
              updatedat: null,
              deletedat: null,
            },
          ],
        },
        rent: {
          monthlyExpenseTotal: 2000,
          monthlyBucketAllocation: 0,
          monthlyExpenses: [
            {
              id: '3',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'rent',
              amount: 2000,
              expensedate: '2023-10-01',
              createdat: '2023-10-01T12:00:00Z',
              updatedat: null,
              deletedat: null,
            },
          ],
        },
      };

      const result =
        await formatMonthlyExpensesToBucketExpenses(monthlyExpenses);
      expect(result).toEqual(expected);
    });

    it('should handle an empty list of monthly expenses', async () => {
      const monthlyExpenses: MonthlyExpenseWithTimestamps[] = [];
      const expected = {};

      const result =
        await formatMonthlyExpensesToBucketExpenses(monthlyExpenses);
      expect(result).toEqual(expected);
    });

    it('should handle expenses with the same bucket but different dates', async () => {
      const monthlyExpenses = [
        {
          id: '1',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'utilities',
          amount: 120,
          expensedate: '2023-10-01T12:00:00Z',
          createdat: '2023-10-01T12:00:00Z',
          updatedat: null,
          deletedat: null,
        },
        {
          id: '2',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'utilities',
          amount: 80,
          expensedate: '2023-10-15T12:00:00Z',
          createdat: '2023-10-15T12:00:00Z',
          updatedat: null,
          deletedat: null,
        },
      ];

      const expected = {
        utilities: {
          monthlyExpenseTotal: 200,
          monthlyBucketAllocation: 0,
          monthlyExpenses: [
            {
              id: '1',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'utilities',
              amount: 120,
              expensedate: '2023-10-01',
              createdat: '2023-10-01T12:00:00Z',
              updatedat: null,
              deletedat: null,
            },
            {
              id: '2',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'utilities',
              amount: 80,
              expensedate: '2023-10-15',
              createdat: '2023-10-15T12:00:00Z',
              updatedat: null,
              deletedat: null,
            },
          ],
        },
      };

      const result =
        await formatMonthlyExpensesToBucketExpenses(monthlyExpenses);
      expect(result).toEqual(expected);
    });

    it('should correctly format the date to YYYY-MM-DD', async () => {
      const monthlyExpenses = [
        {
          id: '1',
          vendor: 'Walmart',
          person: 'John Doe',
          description: 'Weekly groceries',
          bucketname: 'entertainment',
          amount: 50,
          expensedate: '2023-10-05T18:30:00Z',
          createdat: '2023-10-05T18:30:00Z',
          updatedat: null,
          deletedat: null,
        },
      ];

      const expected = {
        entertainment: {
          monthlyExpenseTotal: 50,
          monthlyBucketAllocation: 0,
          monthlyExpenses: [
            {
              id: '1',
              vendor: 'Walmart',
              person: 'John Doe',
              description: 'Weekly groceries',
              bucketname: 'entertainment',
              amount: 50,
              expensedate: '2023-10-05',
              createdat: '2023-10-05T18:30:00Z',
              updatedat: null,
              deletedat: null,
            },
          ],
        },
      };

      const result =
        await formatMonthlyExpensesToBucketExpenses(monthlyExpenses);
      expect(result).toEqual(expected);
    });
  });
});
