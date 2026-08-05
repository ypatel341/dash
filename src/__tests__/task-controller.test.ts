import request from 'supertest';
import { app, server, db } from '../server';
import {
  listCategoriesService,
  createCategoryService,
  updateCategoryService,
  getTaskByIdService,
  listTasksService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  validateCreateTask,
  validateUpdateTask,
  validateCreateCategory,
  validateUpdateCategory,
} from '../server/services/taskService';
import { listSeriesService } from '../server/services/seriesService';
import {
  createTestTask,
  createTestTaskCategory,
  createTestCreateTaskRequest,
  createTestCreateCategoryRequest,
} from '../server/utils/data-factory/taskTestDataFactory';

jest.mock('../server/services/taskService', () => ({
  validateCreateTask: jest.fn(),
  validateUpdateTask: jest.fn(),
  validateCreateCategory: jest.fn(),
  validateUpdateCategory: jest.fn(),
  listCategoriesService: jest.fn(),
  createCategoryService: jest.fn(),
  updateCategoryService: jest.fn(),
  getTaskByIdService: jest.fn(),
  listTasksService: jest.fn(),
  createTaskService: jest.fn(),
  updateTaskService: jest.fn(),
  deleteTaskService: jest.fn(),
}));

jest.mock('../server/services/seriesService', () => ({
  validateCreateSeries: jest.fn(),
  validateUpdateSeries: jest.fn(),
  listSeriesService: jest.fn(),
  getSeriesByIdService: jest.fn(),
  createSeriesService: jest.fn(),
  updateSeriesService: jest.fn(),
  pauseSeriesService: jest.fn(),
  resumeSeriesService: jest.fn(),
  archiveSeriesService: jest.fn(),
  ensureOccurrencesForDateRange: jest.fn().mockResolvedValue(undefined),
}));

afterAll(async () => {
  await db.destroy();
  server.close();
});

afterEach(() => {
  jest.clearAllMocks();
});

// --- Category Endpoints ---

describe('GET /tasks/categories', () => {
  it('should return a list of categories', async () => {
    const categories = [createTestTaskCategory()];
    (listCategoriesService as jest.Mock).mockResolvedValue(categories);

    const response = await request(app).get('/api/tasks/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(categories);
  });

  it('should return 500 on service error', async () => {
    (listCategoriesService as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    const response = await request(app).get('/api/tasks/categories');
    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Internal Server Error');
  });
});

describe('POST /tasks/categories', () => {
  it('should create a category and return 201', async () => {
    const categoryReq = createTestCreateCategoryRequest();
    const category = createTestTaskCategory();
    (validateCreateCategory as jest.Mock).mockReturnValue(categoryReq);
    (createCategoryService as jest.Mock).mockResolvedValue(category);

    const response = await request(app)
      .post('/api/tasks/categories')
      .send(categoryReq);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(category);
  });

  it('should return 400 on validation error', async () => {
    (validateCreateCategory as jest.Mock).mockImplementation(() => {
      throw new Error('name is required');
    });

    const response = await request(app).post('/api/tasks/categories').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('name is required');
  });
});

describe('PATCH /tasks/categories/:id', () => {
  it('should update a category', async () => {
    const category = createTestTaskCategory({ name: 'Updated' });
    (validateUpdateCategory as jest.Mock).mockReturnValue({ name: 'Updated' });
    (updateCategoryService as jest.Mock).mockResolvedValue(category);

    const response = await request(app)
      .patch('/api/tasks/categories/cat-1')
      .send({ name: 'Updated' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated');
  });

  it('should return 404 if category not found', async () => {
    (validateUpdateCategory as jest.Mock).mockReturnValue({ name: 'X' });
    (updateCategoryService as jest.Mock).mockRejectedValue(
      new Error('Category not found'),
    );

    const response = await request(app)
      .patch('/api/tasks/categories/missing')
      .send({ name: 'X' });

    expect(response.status).toBe(404);
  });
});

// --- Task Endpoints ---

describe('GET /tasks', () => {
  it('should return tasks within date range', async () => {
    const tasks = [createTestTask()];
    (listTasksService as jest.Mock).mockResolvedValue(tasks);

    const response = await request(app).get(
      '/api/tasks?from=2026-08-01&to=2026-08-31',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(tasks);
    expect(listTasksService).toHaveBeenCalledWith(
      '2026-08-01',
      '2026-08-31',
      undefined,
      undefined,
    );
  });

  it('should pass status and assignedTo filters', async () => {
    (listTasksService as jest.Mock).mockResolvedValue([]);

    await request(app).get(
      '/api/tasks?from=2026-08-01&to=2026-08-31&status=planned&assignedTo=Yogi',
    );

    expect(listTasksService).toHaveBeenCalledWith(
      '2026-08-01',
      '2026-08-31',
      'planned',
      'Yogi',
    );
  });

  it('should return 400 when from/to are missing', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('from and to');
  });

  it('should return 400 for invalid status', async () => {
    const response = await request(app).get(
      '/api/tasks?from=2026-08-01&to=2026-08-31&status=overdue',
    );
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid status');
  });

  it('should return 400 for invalid assignedTo', async () => {
    const response = await request(app).get(
      '/api/tasks?from=2026-08-01&to=2026-08-31&assignedTo=Nobody',
    );
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid assignedTo');
  });
});

describe('GET /tasks/:id', () => {
  it('should return a task by id', async () => {
    const task = createTestTask();
    (getTaskByIdService as jest.Mock).mockResolvedValue(task);

    const response = await request(app).get('/api/tasks/task-1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(task);
  });

  it('should return 404 if task not found', async () => {
    (getTaskByIdService as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get('/api/tasks/missing');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('should return 500 on service error', async () => {
    (getTaskByIdService as jest.Mock).mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/api/tasks/task-1');
    expect(response.status).toBe(500);
  });
});

describe('POST /tasks', () => {
  it('should create a task and return 201', async () => {
    const taskReq = createTestCreateTaskRequest();
    const task = createTestTask();
    (validateCreateTask as jest.Mock).mockReturnValue(taskReq);
    (createTaskService as jest.Mock).mockResolvedValue(task);

    const response = await request(app).post('/api/tasks').send(taskReq);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(task);
  });

  it('should return 400 on validation error', async () => {
    (validateCreateTask as jest.Mock).mockImplementation(() => {
      throw new Error('title is required');
    });

    const response = await request(app).post('/api/tasks').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('title is required');
  });

  it('should return 400 when category does not exist', async () => {
    const taskReq = createTestCreateTaskRequest();
    (validateCreateTask as jest.Mock).mockReturnValue(taskReq);
    (createTaskService as jest.Mock).mockRejectedValue(
      new Error('Category not found: cat-missing'),
    );

    const response = await request(app).post('/api/tasks').send(taskReq);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Category not found');
  });
});

describe('PATCH /tasks/:id', () => {
  it('should update a task', async () => {
    const updated = createTestTask({ title: 'Updated' });
    (validateUpdateTask as jest.Mock).mockReturnValue({ title: 'Updated' });
    (updateTaskService as jest.Mock).mockResolvedValue(updated);

    const response = await request(app)
      .patch('/api/tasks/task-1')
      .send({ title: 'Updated' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated');
  });

  it('should return 404 if task not found', async () => {
    (validateUpdateTask as jest.Mock).mockReturnValue({ title: 'X' });
    (updateTaskService as jest.Mock).mockRejectedValue(
      new Error('Task not found'),
    );

    const response = await request(app)
      .patch('/api/tasks/missing')
      .send({ title: 'X' });

    expect(response.status).toBe(404);
  });

  it('should return 400 on invalid status transition', async () => {
    (validateUpdateTask as jest.Mock).mockReturnValue({
      status: 'planned',
    });
    (updateTaskService as jest.Mock).mockRejectedValue(
      new Error('Cannot transition from completed to planned'),
    );

    const response = await request(app)
      .patch('/api/tasks/task-1')
      .send({ status: 'planned' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Cannot transition');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should soft-delete a task and return 204', async () => {
    (deleteTaskService as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/api/tasks/task-1');
    expect(response.status).toBe(204);
  });

  it('should return 404 if task not found', async () => {
    (deleteTaskService as jest.Mock).mockRejectedValue(
      new Error('Task not found'),
    );

    const response = await request(app).delete('/api/tasks/missing');
    expect(response.status).toBe(404);
  });
});

// --- Series listing ---

describe('GET /tasks/series', () => {
  it('should return a list of active series', async () => {
    (listSeriesService as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get('/api/tasks/series');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
