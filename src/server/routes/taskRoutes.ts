import { Router } from 'express';
import {
  listCategoriesController,
  createCategoryController,
  updateCategoryController,
  listTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
} from '../controllers/taskController';

const router = Router();

// Static routes first — must be registered before /:id
router.get('/categories', listCategoriesController);
router.post('/categories', createCategoryController);
router.patch('/categories/:id', updateCategoryController);

// Series placeholder (PR 2)
router.get('/series', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// Task listing
router.get('/', listTasksController);

// Task CRUD
router.post('/', createTaskController);
router.get('/:id', getTaskController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

export default router;
