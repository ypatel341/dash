import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './utils/db';
import { validateExpense } from './utils/utils';
import logger from './utils/logger';

import { InsertExpsenseType, BudgetType } from './utils/types';
import { getAllBudgetData, insertExpense } from './utils/db-operation-helpers';

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// GET: Create an endpoint that will retrieve a budget plan for a specific allocation
app.get('/budget/info/all', async (req, res) => {
  try {
    const data: BudgetType[] = await getAllBudgetData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/budget/info/monthexpense', async (req, res) => {
  try {
    const data = await db.raw(`
      SELECT * FROM 
      budget_monthly_expenses 
      WHERE expense_date >= date_trunc('month', CURRENT_DATE)
      AND expense_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
      ORDER BY expense_date DESC`);
    console.log('datastructure', data.rows);
    return data.rows;
  } catch (error) {}
});

// POST: Create an endpoint that will add a new expense to the allocated bucket in the budget plan
app.post('/budget/expense', async (req, res) => {
  try {
    const expense: InsertExpsenseType = await validateExpense(req.body);
    const response = await insertExpense(expense);
    res.json(response);
  } catch (error) {
    logger.error(`Error validating expense: ${error}`);
    res.status(400).json({ error: `Invalid requestbody ${error}` });
  }
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// if (process.env.NODE_ENV !== 'test') {
//   app.listen(port, () =>
//     console.log(`Server running on port ${port}, http://localhost:${port}`),
//   );
// }

export { app, server, db };
