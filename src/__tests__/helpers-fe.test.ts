import { BudgetData } from '../app/budgeting-page/types/BudgetCategoryTypes';
import {
  calculateSurplus,
  formatMonthlyExpensesExpenseDate,
  formatMonthlyExpensesToBucketExpenses,
} from '../app/budgeting-page/utils/helpers';
import {
  createBucketBudgetData,
  createMonthlyExpense,
} from '../server/utils/data-factory/testDataFactory';
import { MonthlyExpense } from '../server/utils/types';

describe('formatMonthlyExpensesToBucketExpenses', () => {
  it('should accumulate amounts for each bucket and update existing budget data', async () => {
    const monthlyExpenses: MonthlyExpense[] = [
      createMonthlyExpense({ amount: 1000, bucketname: 'rent' }),
      createMonthlyExpense({ amount: 200, bucketname: 'groceries' }),
      createMonthlyExpense({ amount: 500, bucketname: 'rent' }),
    ];

    const existingBudgetData: BudgetData[] = [
      createBucketBudgetData({ bucketname: 'rent' }),
      createBucketBudgetData({ id: '2', bucketname: 'groceries' }),
      createBucketBudgetData({ id: '3', bucketname: 'electric' }),
    ];

    const result = await formatMonthlyExpensesToBucketExpenses(
      monthlyExpenses,
      existingBudgetData,
    );

    expect(result).toEqual([
      {
        id: '1',
        category: 'test',
        amount: 0,
        bucketname: 'rent',
        household: 'test',
        currentamount: 1500,
      },
      {
        id: '2',
        category: 'test',
        amount: 0,
        bucketname: 'groceries',
        household: 'test',
        currentamount: 200,
      },
      {
        id: '3',
        category: 'test',
        amount: 0,
        bucketname: 'electric',
        household: 'test',
        currentamount: 0,
      },
    ]);
  });

  it('should not update buckets that are not in the monthly expenses', async () => {
    const monthlyExpenses: MonthlyExpense[] = [
      createMonthlyExpense({ bucketname: 'internet', amount: 100 }),
    ];

    const existingBudgetData: BudgetData[] = [
      createBucketBudgetData({ bucketname: 'rent' }),
      createBucketBudgetData({ id: '2', bucketname: 'groceries' }),
      createBucketBudgetData({ id: '3', bucketname: 'internet' }),
    ];

    const result = await formatMonthlyExpensesToBucketExpenses(
      monthlyExpenses,
      existingBudgetData,
    );

    expect(result).toEqual([
      {
        id: '1',
        category: 'test',
        amount: 0,
        bucketname: 'rent',
        household: 'test',
        currentamount: 0,
      },
      {
        id: '2',
        category: 'test',
        amount: 0,
        bucketname: 'groceries',
        household: 'test',
        currentamount: 0,
      },
      {
        id: '3',
        category: 'test',
        amount: 0,
        bucketname: 'internet',
        household: 'test',
        currentamount: 100,
      },
    ]);
  });

  it('should handle empty monthly expenses', async () => {
    const monthlyExpenses: MonthlyExpense[] = [];

    const existingBudgetData: BudgetData[] = [
      createBucketBudgetData({ bucketname: 'rent' }),
      createBucketBudgetData({ id: '2', bucketname: 'groceries' }),
    ];

    const result = await formatMonthlyExpensesToBucketExpenses(
      monthlyExpenses,
      existingBudgetData,
    );

    expect(result).toEqual([
      {
        id: '1',
        category: 'test',
        amount: 0,
        bucketname: 'rent',
        household: 'test',
        currentamount: 0,
      },
      {
        id: '2',
        category: 'test',
        amount: 0,
        bucketname: 'groceries',
        household: 'test',
        currentamount: 0,
      },
    ]);
  });
});

describe('formatMonthlyExpensesExpenseDate', () => {
  it('should format the expensedate for each expense', async () => {
    const expenses: MonthlyExpense[] = [
      // 2025-02-07 21:58:17.539 -0500
      createMonthlyExpense({
        bucketname: 'rent',
        expensedate: '2025-03-31T21:58:17.539',
        amount: 1000,
      }),
      createMonthlyExpense({
        id: '2',
        bucketname: 'groceries',
        expensedate: '2025-03-31T21:58:17.539',
        amount: 200,
      }),
    ];

    const createdPerson1 = expenses[0].person;
    const createdPerson2 = expenses[1].person;

    const result = await formatMonthlyExpensesExpenseDate(expenses);

    expect(result).toEqual([
      {
        id: '1',
        person: createdPerson1,
        vendor: 'test',
        description: 'test',
        expensedate: '03/31/2025',
        bucketname: 'rent',
        amount: 1000,
      },
      {
        id: '2',
        person: createdPerson2,
        vendor: 'test',
        description: 'test',
        expensedate: '03/31/2025',
        bucketname: 'groceries',
        amount: 200,
      },
    ]);
  });

  it('should handle empty expenses', async () => {
    const expenses: MonthlyExpense[] = [];

    const result = await formatMonthlyExpensesExpenseDate(expenses);

    expect(result).toEqual([]);
  });
});

describe('calculateSurplus', () => {
  it('should calculate the monthly total amount and current monthly usage', async () => {
    const budgetData: BudgetData[] = [
      createBucketBudgetData({
        amount: 1000,
        bucketname: 'rent',
        currentamount: 500,
      }),
      createBucketBudgetData({
        id: '2',
        amount: 200,
        bucketname: 'groceries',
        currentamount: 100,
      }),
      createBucketBudgetData({
        id: '3',
        amount: 300,
        bucketname: 'electric',
        currentamount: 200,
      }),
    ];

    const result = await calculateSurplus(budgetData);

    expect(result).toEqual({
      monthlyTotalBudget: 1500,
      currentMonthlyUsage: 800,
      monthlySurplus: 700,
    });
  });

  it('should handle empty budget data', async () => {
    const budgetData: BudgetData[] = [];

    const result = await calculateSurplus(budgetData);

    expect(result).toEqual({
      monthlyTotalBudget: 0,
      currentMonthlyUsage: 0,
      monthlySurplus: 0,
    });
  });

  it('should handle budget data with negative amounts', async () => {
    const budgetData: BudgetData[] = [
      createBucketBudgetData({
        amount: -1000,
        bucketname: 'rent',
        currentamount: -500,
      }),
      createBucketBudgetData({
        id: '2',
        amount: -200,
        bucketname: 'groceries',
        currentamount: -100,
      }),
      createBucketBudgetData({
        id: '3',
        amount: -300,
        bucketname: 'electric',
        currentamount: -200,
      }),
    ];

    const result = await calculateSurplus(budgetData);

    expect(result).toEqual({
      monthlyTotalBudget: -1500,
      currentMonthlyUsage: -800,
      monthlySurplus: -700,
    });
  });

  it('should handle budget data with mixed positive and negative amounts', async () => {
    const budgetData: BudgetData[] = [
      createBucketBudgetData({
        amount: 1000,
        bucketname: 'rent',
        currentamount: 500,
      }),
      createBucketBudgetData({
        id: '2',
        amount: 200,
        bucketname: 'groceries',
        currentamount: -100,
      }),
      createBucketBudgetData({
        id: '3',
        amount: 300,
        bucketname: 'electric',
        currentamount: -200,
      }),
    ];

    const result = await calculateSurplus(budgetData);

    expect(result).toEqual({
      monthlyTotalBudget: 1500,
      currentMonthlyUsage: 200,
      monthlySurplus: 1300,
    });
  });
});
