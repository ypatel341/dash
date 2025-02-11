import { Request, Response } from 'express';
import {
  deleteExpenseService,
  getAllBucketExpenses,
  getAllMonthlyExpense,
  getBucketExpenses,
  insertExpenseService,
} from '../services/budgetService';
import logger from '../utils/logger';
import { validateExpense, validateInputBucket } from '../utils/utils';

export const getAllMonthlyExpenses = async (req: Request, res: Response) => {
  logger.log(req.body);
  try {
    const data = await getAllMonthlyExpense();
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: 'Failed to fetch monthly expense data' });
  }
};

export const getAllBucketExpensesController = async (
  req: Request,
  res: Response,
) => {
  logger.log(req.body);
  try {
    const data = await getAllBucketExpenses();
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const getBucketExpensesController = async (
  req: Request,
  res: Response,
) => {
  const { bucketname } = req.params;

  if (!(await validateInputBucket(bucketname))) {
    res.status(400).json({ error: `Invalid bucketname ${bucketname}` });
    return;
  }

  try {
    const bucketData = await getBucketExpenses(bucketname);
    res.json(bucketData);
  } catch (error) {
    logger.error(`Error fetching monthly expense data: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const insertExpenseController = async (req: Request, res: Response) => {
  try {
    const expense = await validateExpense(req.body);
    const response = await insertExpenseService(expense);
    res.json(response);
  } catch (error) {
    logger.error(`Error validating expense: ${error}`);
    res.status(400).json({ error: `Invalid request body ${error}` });
  }
};

export const deleteExpenseController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await deleteExpenseService(id);
    res.json(response);
  } catch (error) {
    logger.error(`Error deleting expense: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
