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
import {
  listSeriesController,
  getSeriesController,
  createSeriesController,
  updateSeriesController,
  pauseSeriesController,
  resumeSeriesController,
  archiveSeriesController,
} from '../controllers/seriesController';

const router = Router();

// Static routes first — must be registered before /:id
router.get('/categories', listCategoriesController);
router.post('/categories', createCategoryController);
router.patch('/categories/:id', updateCategoryController);

// Series routes
router.get('/series', listSeriesController);
router.post('/series', createSeriesController);
router.get('/series/:id', getSeriesController);
router.patch('/series/:id', updateSeriesController);
router.post('/series/:id/pause', pauseSeriesController);
router.post('/series/:id/resume', resumeSeriesController);
router.post('/series/:id/archive', archiveSeriesController);

// Task listing
router.get('/', listTasksController);

// Task CRUD
router.post('/', createTaskController);
router.get('/:id', getTaskController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

export default router;
