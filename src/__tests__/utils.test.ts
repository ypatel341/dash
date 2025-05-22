import { ExpenseAmountMinAndMaxError } from '../server/utils/consts';
import { getAllBudgetData } from '../server/utils/db-operation-helpers';
import {
  MonthlyExpense,
  BudgetTypeWithCurrentAmount,
  ExpenseRequestBody,
  InsertExpenseType,
  MonthlyExpenseWithTimestamps,
  AggregatedMonthlyReport,
} from '../server/utils/types';
import {
  calculateBucketExpenses,
  formatMonthlyExpensesToBucketExpenses,
  validateExpense,
  validateInputBucket,
} from '../server/utils/utils';
import {
  createAggregatedMonthlyReport,
  createBudgetTypeWithCurrentAmount,
  createExpenseRequestBody,
  createInsertExpense,
  createMonthlyExpense,
  createMonthlyExpenseWithTimestamps,
} from '../server/utils/data-factory/testDataFactory';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getAllBudgetData: jest.fn(),
}));

describe('calculateBucketExpenses', () => {
  it('should calculate the current amount spent for each bucket', async () => {
    const rawMonthlyData = [
      createMonthlyExpense({ bucketname: 'rent', amount: 1000 }),
      createMonthlyExpense({ bucketname: 'groceries', amount: 200 }),
      createMonthlyExpense({ bucketname: 'rent', amount: 500 }),
      createMonthlyExpense({ bucketname: 'entertainment', amount: 150 }),
    ];

    const allBudgetData = [
      createBudgetTypeWithCurrentAmount({ bucketname: 'rent', amount: 2000 }),
      createBudgetTypeWithCurrentAmount({
        id: '2',
        bucketname: 'groceries',
        amount: 300,
        category: 'food',
      }),
      createBudgetTypeWithCurrentAmount({
        id: '3',
        bucketname: 'entertainment',
        amount: 200,
        category: 'fun',
      }),
    ];

    const expectedCalculatedBudgetExpenses = [
      createBudgetTypeWithCurrentAmount({
        bucketname: 'rent',
        amount: 2000,
        currentamount: 1500,
      }),
      createBudgetTypeWithCurrentAmount({
        id: '2',
        bucketname: 'groceries',
        amount: 300,
        currentamount: 200,
        category: 'food',
      }),
      createBudgetTypeWithCurrentAmount({
        id: '3',
        bucketname: 'entertainment',
        amount: 200,
        currentamount: 150,
        category: 'fun',
      }),
    ];

    const result = await calculateBucketExpenses(rawMonthlyData, allBudgetData);
    expect(result).toEqual(expectedCalculatedBudgetExpenses);
  });

  it('should return zero current amount for buckets with no expenses', async () => {
    const rawMonthlyDataTest2 = [
      createMonthlyExpense({ bucketname: 'groceries', amount: 0 }),
    ];
    const allBudgetDataTest2 = [
      createBudgetTypeWithCurrentAmount({ bucketname: 'rent', amount: 2000 }),
      createBudgetTypeWithCurrentAmount({
        bucketname: 'groceries',
        amount: 300,
      }),
    ];
    const expectedTest2 = [
      createBudgetTypeWithCurrentAmount({
        bucketname: 'rent',
        currentamount: 0,
      }),
      createBudgetTypeWithCurrentAmount({
        bucketname: 'groceries',
        amount: 300,
        currentamount: 0,
      }),
    ];

    const result = await calculateBucketExpenses(
      rawMonthlyDataTest2,
      allBudgetDataTest2,
    );
    expect(result).toEqual(expectedTest2);
  });

  it('should handle empty rawMonthlyData', async () => {
    const emptyRawMonthlyData: MonthlyExpense[] = [];

    const expected: BudgetTypeWithCurrentAmount[] = [
      createBudgetTypeWithCurrentAmount({ bucketname: 'rent', amount: 2000 }),
      createBudgetTypeWithCurrentAmount({
        bucketname: 'groceries',
        amount: 300,
        currentamount: 0,
      }),
    ];
    const allBudgetDataTest2 = [
      createBudgetTypeWithCurrentAmount({ bucketname: 'rent', amount: 2000 }),
      createBudgetTypeWithCurrentAmount({
        bucketname: 'groceries',
        amount: 300,
      }),
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
    const reqBody: ExpenseRequestBody = createExpenseRequestBody({
      bucketname: 'rent'
    });
    const expected: InsertExpenseType = createInsertExpense({
      bucketname: 'rent'
    });

    const result = await validateExpense(reqBody);
    expect(result).toEqual(expected);
  });

  it('should throw an error if amount is missing or invalid', async () => {
    const reqBody: ExpenseRequestBody = createExpenseRequestBody({
      amount: -100,
    });

    await expect(validateExpense(reqBody)).rejects.toThrow(
      ExpenseAmountMinAndMaxError,
    );
  });

  it('should throw an error if required fields are missing', async () => {
    const reqBody: ExpenseRequestBody = createExpenseRequestBody({
      person: '',
      bucketname: 'groceries'
    });

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
      const monthlyExpenses: MonthlyExpenseWithTimestamps[] = [
        createMonthlyExpenseWithTimestamps({
          bucketname: "groceries"
        }),
        createMonthlyExpenseWithTimestamps({
          id: '2',
          amount: 50,
          bucketname: 'groceries',
          expensedate: '2023-10-02T12:00:00Z',
          createdat: '2023-10-02T12:00:00Z',
        }),
        createMonthlyExpenseWithTimestamps({
          id: '3',
          bucketname: 'rent',
          amount: 2000,
        }),
      ];

      const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
        groceries: {
          monthlyExpenseTotal: 150,
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
      });

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
