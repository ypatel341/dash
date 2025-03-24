import { Request, Response } from 'express';
import {
  deleteExpenseService,
  getAllBucketExpenses,
  getAllMonthlyExpense,
  getAllMonthlyExpensesByMonth,
  getBucketExpenses,
  insertExpenseService,
  updateExpenseService,
  dbHealthCheckService,
} from '../services/budgetService';
import logger from '../utils/logger';
import { validateExpense, validateInputBucket } from '../utils/utils';
import { UpdateExpenseType } from '../utils/types';

export const getAllMonthlyExpenses = async (req: Request, res: Response) => {
  logger.info(req.body);
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
  logger.info(req.body);
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

export const updateExpenseController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await validateExpense(req.body);

  const updateExpense: UpdateExpenseType = {
    id,
    updatedat: new Date().toISOString(),
    ...expense,
  };

  try {
    const response = await updateExpenseService(updateExpense);
    res.json(response);
  } catch (error) {
    logger.error(`Error updating expense: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const getByMonthExpenseController = async (
  req: Request,
  res: Response,
) => {
  const { month } = req.params;

  if (!month) {
    res.status(400).json({ error: 'Missing month parameter' });
  }

  try {
    const response = await getAllMonthlyExpensesByMonth(month);
    res.json(response);
  } catch (error) {
    logger.error(`Error getting monthly expense by month ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const healthCheckDbController = async (req: Request, res: Response) => {
  logger.info(`DB health check start, ${req}`);
  try {
    const response = await dbHealthCheckService();
    res.json(response);
  } catch (error) {
    logger.error(`Error checking DB health: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const healthCheckController = async (req: Request, res: Response) => {
  logger.info(`Health check, ${req}`);
  res.status(200).json({ status: 'UP' });
};
