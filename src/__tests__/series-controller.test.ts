import request from 'supertest';
import { app, server, db } from '../server';
import {
  listSeriesService,
  getSeriesByIdService,
  createSeriesService,
  updateSeriesService,
  pauseSeriesService,
  resumeSeriesService,
  archiveSeriesService,
  validateCreateSeries,
  validateUpdateSeries,
} from '../server/services/seriesService';
import {
  createTestTaskSeries,
  createTestCreateSeriesRequest,
  createTestRecurringTask,
} from '../server/utils/data-factory/taskTestDataFactory';

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

afterAll(async () => {
  await db.destroy();
  server.close();
});

afterEach(() => {
  jest.clearAllMocks();
});

// --- GET /tasks/series ---

describe('GET /tasks/series', () => {
  it('should return a list of series', async () => {
    const series = [createTestTaskSeries()];
    (listSeriesService as jest.Mock).mockResolvedValue(series);

    const response = await request(app).get('/tasks/series');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(series);
  });

  it('should return 500 on service error', async () => {
    (listSeriesService as jest.Mock).mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/tasks/series');
    expect(response.status).toBe(500);
  });
});

// --- POST /tasks/series ---

describe('POST /tasks/series', () => {
  it('should create a series and return 201', async () => {
    const validated = createTestCreateSeriesRequest();
    const series = createTestTaskSeries();
    const tasks = [createTestRecurringTask()];

    (validateCreateSeries as jest.Mock).mockReturnValue(validated);
    (createSeriesService as jest.Mock).mockResolvedValue({ series, tasks });

    const response = await request(app).post('/tasks/series').send(validated);

    expect(response.status).toBe(201);
    expect(response.body.series).toEqual(series);
    expect(response.body.tasks).toEqual(tasks);
  });

  it('should return 400 on validation error', async () => {
    (validateCreateSeries as jest.Mock).mockImplementation(() => {
      throw new Error('title is required');
    });

    const response = await request(app).post('/tasks/series').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('title is required');
  });
});

// --- GET /tasks/series/:id ---

describe('GET /tasks/series/:id', () => {
  it('should return a series by id', async () => {
    const series = createTestTaskSeries();
    (getSeriesByIdService as jest.Mock).mockResolvedValue(series);

    const response = await request(app).get('/tasks/series/series-1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(series);
  });

  it('should return 404 if not found', async () => {
    (getSeriesByIdService as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get('/tasks/series/missing');
    expect(response.status).toBe(404);
  });

  it('should return 500 on service error', async () => {
    (getSeriesByIdService as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    const response = await request(app).get('/tasks/series/series-1');
    expect(response.status).toBe(500);
  });
});

// --- PATCH /tasks/series/:id ---

describe('PATCH /tasks/series/:id', () => {
  it('should update a series', async () => {
    const series = createTestTaskSeries({ title: 'Updated' });
    (validateUpdateSeries as jest.Mock).mockReturnValue({ title: 'Updated' });
    (updateSeriesService as jest.Mock).mockResolvedValue(series);

    const response = await request(app)
      .patch('/tasks/series/series-1')
      .send({ title: 'Updated' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated');
  });

  it('should return 404 if series not found', async () => {
    (validateUpdateSeries as jest.Mock).mockReturnValue({ title: 'Nope' });
    (updateSeriesService as jest.Mock).mockRejectedValue(
      new Error('Series not found'),
    );

    const response = await request(app)
      .patch('/tasks/series/missing')
      .send({ title: 'Nope' });

    expect(response.status).toBe(404);
  });

  it('should return 400 on validation error', async () => {
    (validateUpdateSeries as jest.Mock).mockImplementation(() => {
      throw new Error('status cannot be changed via update');
    });

    const response = await request(app)
      .patch('/tasks/series/series-1')
      .send({ status: 'paused' });

    expect(response.status).toBe(400);
  });
});

// --- POST /tasks/series/:id/pause ---

describe('POST /tasks/series/:id/pause', () => {
  it('should pause a series', async () => {
    const paused = createTestTaskSeries({ status: 'paused' });
    (pauseSeriesService as jest.Mock).mockResolvedValue(paused);

    const response = await request(app).post('/tasks/series/series-1/pause');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('paused');
  });

  it('should return 404 if series not found', async () => {
    (pauseSeriesService as jest.Mock).mockRejectedValue(
      new Error('Series not found'),
    );

    const response = await request(app).post('/tasks/series/missing/pause');
    expect(response.status).toBe(404);
  });

  it('should return 400 on invalid transition', async () => {
    (pauseSeriesService as jest.Mock).mockRejectedValue(
      new Error('Cannot transition from archived to paused'),
    );

    const response = await request(app).post('/tasks/series/series-1/pause');
    expect(response.status).toBe(400);
  });
});

// --- POST /tasks/series/:id/resume ---

describe('POST /tasks/series/:id/resume', () => {
  it('should resume a series', async () => {
    const active = createTestTaskSeries({ status: 'active' });
    const tasks = [createTestRecurringTask()];
    (resumeSeriesService as jest.Mock).mockResolvedValue({
      series: active,
      tasks,
    });

    const response = await request(app).post('/tasks/series/series-1/resume');
    expect(response.status).toBe(200);
    expect(response.body.series.status).toBe('active');
    expect(response.body.tasks).toHaveLength(1);
  });

  it('should return 404 if series not found', async () => {
    (resumeSeriesService as jest.Mock).mockRejectedValue(
      new Error('Series not found'),
    );

    const response = await request(app).post('/tasks/series/missing/resume');
    expect(response.status).toBe(404);
  });

  it('should return 400 on invalid transition', async () => {
    (resumeSeriesService as jest.Mock).mockRejectedValue(
      new Error('Cannot transition from active to active'),
    );

    const response = await request(app).post('/tasks/series/series-1/resume');
    expect(response.status).toBe(400);
  });
});

// --- POST /tasks/series/:id/archive ---

describe('POST /tasks/series/:id/archive', () => {
  it('should archive a series', async () => {
    const archived = createTestTaskSeries({ status: 'archived' });
    (archiveSeriesService as jest.Mock).mockResolvedValue(archived);

    const response = await request(app).post('/tasks/series/series-1/archive');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('archived');
  });

  it('should return 404 if series not found', async () => {
    (archiveSeriesService as jest.Mock).mockRejectedValue(
      new Error('Series not found'),
    );

    const response = await request(app).post('/tasks/series/missing/archive');
    expect(response.status).toBe(404);
  });

  it('should return 400 on invalid transition', async () => {
    (archiveSeriesService as jest.Mock).mockRejectedValue(
      new Error('Cannot transition from archived to archived'),
    );

    const response = await request(app).post('/tasks/series/series-1/archive');
    expect(response.status).toBe(400);
  });
});
