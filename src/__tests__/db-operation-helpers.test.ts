import { db, server } from '../server';
import {
  deleteExpense,
  getAllMonthlyExpense,
  getAllMonthlyExpenseByMonth,
  insertExpense,
  updateExpense,
} from '../server/utils/db-operation-helpers';
import { getCurrentYearMonth } from '../server/utils/utils';
import { InsertExpenseType, InsertResponseId } from '../server/utils/types';
import { createInsertExpense } from '../server/utils/data-factory/testDataFactory';

describe('handles all DB operations and closes the connection', () => {
  let insertExpenseIdDelete: InsertResponseId;
  let insertExpenseIdUpdate: InsertResponseId;
  let insertExpenseIdMonthly: InsertResponseId;

  const insertData: InsertExpenseType = createInsertExpense({
    person: 'Yogi',
    bucketname: 'rent',
    vendor: 'Domus',
    amount: 3200,
    description: 'January Rent'
  })

  beforeAll(async () => {
    // TODO: if this gets big enough create a loop to insert multiple expenses and delete them later in the loop too to clean up the database
    const expensedate = new Date().toISOString();

    insertExpenseIdDelete = await insertExpense({
      ...insertData,
      expensedate,
    });

    insertExpenseIdUpdate = await insertExpense({
      ...insertData,
      expensedate,
    });

    insertExpenseIdMonthly = await insertExpense({
      person: 'Yogi',
      bucketname: 'groceries',
      vendor: 'Walmart',
      amount: 100,
      description: 'TEST Groceries',
      expensedate,
    });
  });

  it('it should delete an expense', async () => {
    const allMonthlyExpenses = await getAllMonthlyExpense();
    const insertedExpense = allMonthlyExpenses.find(
      (expense) => expense.id === insertExpenseIdDelete.id,
    );
    expect(insertedExpense).toBeDefined();

    allMonthlyExpenses.forEach(async (expense) => {
      if (expense.id === insertExpenseIdDelete.id) {
        await deleteExpense(insertExpenseIdDelete.id);
      }
    });

    const allMonthlyExpensesAfterDelete = await getAllMonthlyExpense();
    const deletedExpense = allMonthlyExpensesAfterDelete.find(
      (expense) => expense.id === insertExpenseIdDelete.id,
    );
    expect(deletedExpense).toBeUndefined();
  });

  it('should return an error if the expense id is invalid', async () => {
    await expect(deleteExpense('invalid-id')).rejects.toThrow();
  });

  it('should update an expense', async () => {
    // The reason we are doing this is because we want to make sure that the expense is actually updated in the database
    // We don't yet have a need to get an expense by id, and we should not expose an endpoint just to make a test more easy
    const allMonthlyExpenses = await getAllMonthlyExpense();
    const insertedExpense = allMonthlyExpenses.find(
      (expense) => expense.id === insertExpenseIdUpdate.id,
    );

    expect(insertedExpense).toBeDefined();

    await updateExpense({
      id: insertExpenseIdUpdate.id,
      updatedat: new Date().toISOString(),
      description: 'updated description',
    });

    const allMonthlyExpensesAfterUpdate = await getAllMonthlyExpense();
    const insertedExpenseAfterUpdate = allMonthlyExpensesAfterUpdate.find(
      (expense) => expense.id === insertExpenseIdUpdate.id,
    );

    expect(insertedExpenseAfterUpdate?.description).toBe('updated description');
  });

  it('should return an error if the expense id is invalid', async () => {
    await expect(
      updateExpense({
        id: 'invalid-id',
        updatedat: new Date().toISOString(),
        description: 'updated description',
      }),
    ).rejects.toThrow();
  });

  it('should get all of the monthly expenses by month', async () => {
    // This test can be cleaned up by updating the beforeAll and afterAll to insert and delete multiple expenses
    // This is just a quick test to make sure that the function is working
    const yearMonth = await getCurrentYearMonth();

    const allMonthlyExpenses = await getAllMonthlyExpenseByMonth(yearMonth);
    const latestExpense = allMonthlyExpenses[0];

    expect(allMonthlyExpenses.length).toBeGreaterThan(0);
    expect(latestExpense.description).toBe('updated description');
  });

  // Hard deleting expense to clean up the database
  afterAll(async () => {
    await db('budget_monthly_expenses')
      .where({ id: insertExpenseIdDelete.id })
      .del();

    await db('budget_monthly_expenses')
      .where({ id: insertExpenseIdUpdate.id })
      .del();

    await db('budget_monthly_expenses')
      .where({ id: insertExpenseIdMonthly.id })
      .del();

    await db.destroy();
    server.close();
  });
});
