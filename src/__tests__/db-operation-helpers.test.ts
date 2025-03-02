import { db, server } from '../server';
import {
  deleteExpense,
  getAllMonthlyExpense,
  getAllMonthlyExpenseByMonth,
  insertExpense,
  updateExpense,
} from '../server/utils/db-operation-helpers';
import { InsertResponseId } from '../server/utils/types';
import { insertData } from '../test_data/budgetData';

describe('handles all DB operations and closes the connection', () => {
  let insertExpenseIdDelete: InsertResponseId;
  let insertExpenseIdUpdate: InsertResponseId;

  beforeAll(async () => {
    // TODO: if this gets big enough create a loop to insert multiple expenses and delete them later in the loop too to clean up the database
    insertExpenseIdDelete = await insertExpense({
      ...insertData,
      expensedate: new Date().toISOString(),
    });

    insertExpenseIdUpdate = await insertExpense({
      ...insertData,
      expensedate: new Date().toISOString(),
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

  it.only('should return all monthly expenses by month', async () => {
    const monthlyExpensesByMonth = await getAllMonthlyExpenseByMonth('2025-01');
    // const monthlyExpensesByMonth2 = await getAllMonthlyExpenseByMonth('2021-02');

    console.log('monthlyExpensesByMonth', monthlyExpensesByMonth);

    // expect(monthlyExpensesByMonth.length).toBeGreaterThan(0);
    // expect(monthlyExpensesByMonth2.length).toBeGreaterThan(0);
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

  // Hard deleting expense to clean up the database
  afterAll(async () => {
    await db('budget_monthly_expenses')
      .where({ id: insertExpenseIdDelete.id })
      .del();

    await db('budget_monthly_expenses')
      .where({ id: insertExpenseIdUpdate.id })
      .del();

    await db.destroy();
    server.close();
  });
});
