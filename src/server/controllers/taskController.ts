import { Request, Response } from 'express';
import logger from '../utils/logger';
import { VALID_TASK_STATUSES, VALID_ASSIGNED_TO } from '../utils/consts';
import {
  validateCreateTask,
  validateUpdateTask,
  validateCreateCategory,
  validateUpdateCategory,
  listCategoriesService,
  createCategoryService,
  updateCategoryService,
  getTaskByIdService,
  listTasksService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
} from '../services/taskService';

// --- Category Controllers ---

export const listCategoriesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const categories = await listCategoriesService();
    res.json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const validated = validateCreateCategory(req.body);
    const category = await createCategoryService(validated);
    res.status(201).json(category);
  } catch (error) {
    logger.error(`Error creating category: ${error}`);
    res.status(400).json({ error: `Failed to create category: ${error}` });
  }
};

export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const validated = validateUpdateCategory(req.body);
    const category = await updateCategoryService(req.params.id, validated);
    res.json(category);
  } catch (error) {
    logger.error(`Error updating category: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    res.status(400).json({ error: `Failed to update category: ${error}` });
  }
};

// --- Task Controllers ---

export const listTasksController = async (req: Request, res: Response) => {
  const { from, to, status, assignedTo } = req.query;

  if (!from || !to) {
    res
      .status(400)
      .json({ error: 'from and to query parameters are required' });
    return;
  }

  if (
    status &&
    !(VALID_TASK_STATUSES as readonly string[]).includes(status as string)
  ) {
    res.status(400).json({ error: `Invalid status: ${status}` });
    return;
  }

  if (
    assignedTo &&
    !(VALID_ASSIGNED_TO as readonly string[]).includes(assignedTo as string)
  ) {
    res.status(400).json({ error: `Invalid assignedTo: ${assignedTo}` });
    return;
  }

  try {
    const tasks = await listTasksService(
      from as string,
      to as string,
      (status as string) || undefined,
      (assignedTo as string) || undefined,
    );
    res.json(tasks);
  } catch (error) {
    logger.error(`Error fetching tasks: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const getTaskController = async (req: Request, res: Response) => {
  try {
    const task = await getTaskByIdService(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    logger.error(`Error fetching task: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const createTaskController = async (req: Request, res: Response) => {
  try {
    const validated = validateCreateTask(req.body);
    const task = await createTaskService(validated);
    res.status(201).json(task);
  } catch (error) {
    logger.error(`Error creating task: ${error}`);
    res.status(400).json({ error: `Failed to create task: ${error}` });
  }
};

export const updateTaskController = async (req: Request, res: Response) => {
  try {
    const validated = validateUpdateTask(req.body);
    const task = await updateTaskService(req.params.id, validated);
    res.json(task);
  } catch (error) {
    logger.error(`Error updating task: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    res.status(400).json({ error: `Failed to update task: ${error}` });
  }
};

export const deleteTaskController = async (req: Request, res: Response) => {
  try {
    await deleteTaskService(req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting task: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
