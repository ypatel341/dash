import { db, server } from '../server';
import {
  deleteExpense,
  getAllMonthlyExpense,
  insertExpense,
} from '../server/utils/db-operation-helpers';
import { InsertResponseId } from '../server/utils/types';
import { insertData } from '../test_data/budgetData';

describe('delete an expense', () => {
  let insertExpenseId: InsertResponseId;

  beforeAll(async () => {
    insertExpenseId = await insertExpense({
      ...insertData,
      expensedate: new Date().toISOString(),
    });
  });

  it('it should delete an expense', async () => {
    const allMonthlyExpenses = await getAllMonthlyExpense();
    const insertedExpense = allMonthlyExpenses.find(
      (expense) => expense.id === insertExpenseId.id,
    );
    expect(insertedExpense).toBeDefined();

    allMonthlyExpenses.forEach(async (expense) => {
      if (expense.id === insertExpenseId.id) {
        await deleteExpense(insertExpenseId.id);
      }
    });

    const allMonthlyExpensesAfterDelete = await getAllMonthlyExpense();
    const deletedExpense = allMonthlyExpensesAfterDelete.find(
      (expense) => expense.id === insertExpenseId.id,
    );
    expect(deletedExpense).toBeUndefined();
  });

  it('should return an error if the expense id is invalid', async () => {
    await expect(deleteExpense('invalid-id')).rejects.toThrow();
  });

  // Hard deleting expense to clean up the database
  afterAll(async () => {
    await db('budget_monthly_expenses').where({ id: insertExpenseId.id }).del();
    await db.destroy();
    server.close();
  });
});
