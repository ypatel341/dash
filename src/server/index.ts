import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './utils/db';
import {
  validateExpense,
  calculateBucketExpenses,
  validateInputBucket,
} from './utils/utils';
import logger from './utils/logger';

import { InsertExpsenseType, BudgetType, MonthlyExpense } from './utils/types';
import {
  getAllBudgetData,
  getAllMonthlyExpense,
  insertExpense,
} from './utils/db-operation-helpers';

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// GET: An Endpoint to get all of the expenses for the current month
app.get('/budget/info/allmonthexpense', async (req, res) => {
  logger.log(req.body);
  try {
    const data: MonthlyExpense[] = await getAllMonthlyExpense();

    res.json(data);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
});

// GET: An endpoint for seeing how much money is left in all buckets
app.get('/budget/info/allbucketexpense', async (req, res) => {
  logger.log(req.body);
  try {
    const rawMonthlyData: MonthlyExpense[] = await getAllMonthlyExpense();
    const allBudgetData: BudgetType[] = await getAllBudgetData();

    const data = await calculateBucketExpenses(rawMonthlyData, allBudgetData);
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
});

// GET: An endpoint for getting all expenses for a specific bucket in a month
app.get('/budget/info/bucketexpense/:bucketname', async (req, res) => {
  const { bucketname } = req.params;

  if (!(await validateInputBucket(bucketname))) {
    res.status(400).json({ error: `Invalid bucketname ${bucketname}` });
    return;
  }

  try {
    const data: MonthlyExpense[] = await getAllMonthlyExpense();
    const bucketData = data.filter(
      (expense) => expense.bucketname === bucketname,
    );
    res.json(bucketData);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
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

export { app, server, db };
