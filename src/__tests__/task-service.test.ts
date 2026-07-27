import {
  validateCreateTask,
  validateUpdateTask,
  validateCreateCategory,
  validateUpdateCategory,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  listTasksService,
  listCategoriesService,
  getTaskByIdService,
  createCategoryService,
  updateCategoryService,
} from '../server/services/taskService';
import {
  getAllTaskCategories,
  getTaskCategoryById,
  insertTaskCategory,
  updateTaskCategory,
  getTaskById,
  getTasksByDateRange,
  insertTask,
  updateTaskById,
  softDeleteTask,
} from '../server/utils/db-operation-helpers';
import {
  createTestTask,
  createTestTaskCategory,
  createTestCreateTaskRequest,
} from '../server/utils/data-factory/taskTestDataFactory';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getAllTaskCategories: jest.fn(),
  getTaskCategoryById: jest.fn(),
  insertTaskCategory: jest.fn(),
  updateTaskCategory: jest.fn(),
  getTaskById: jest.fn(),
  getTasksByDateRange: jest.fn(),
  insertTask: jest.fn(),
  updateTaskById: jest.fn(),
  softDeleteTask: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

// --- validateCreateTask ---

describe('validateCreateTask', () => {
  it('should return a validated request for valid input', () => {
    const input = createTestCreateTaskRequest();
    const result = validateCreateTask(input);

    expect(result.title).toBe('Test Task');
    expect(result.assignedTo).toBe('Yogi');
    expect(result.kind).toBe('event');
    expect(result.modality).toBe('physical');
    expect(result.timeMode).toBe('timed');
    expect(result.startTime).toBe('14:00');
  });

  it('should reject missing title', () => {
    const input = createTestCreateTaskRequest({ title: '' });
    expect(() => validateCreateTask(input)).toThrow('title is required');
  });

  it('should reject invalid assignedTo', () => {
    const input = { ...createTestCreateTaskRequest(), assignedTo: 'Unknown' };
    expect(() => validateCreateTask(input)).toThrow(
      'assignedTo must be one of',
    );
  });

  it('should reject missing categoryId', () => {
    const input = { ...createTestCreateTaskRequest(), categoryId: '' };
    expect(() => validateCreateTask(input)).toThrow('categoryId is required');
  });

  it('should reject invalid kind', () => {
    const input = { ...createTestCreateTaskRequest(), kind: 'reminder' };
    expect(() => validateCreateTask(input)).toThrow('kind must be one of');
  });

  it('should reject invalid modality', () => {
    const input = { ...createTestCreateTaskRequest(), modality: 'hybrid' };
    expect(() => validateCreateTask(input)).toThrow('modality must be one of');
  });

  it('should reject missing taskDate', () => {
    const input = { ...createTestCreateTaskRequest(), taskDate: '' };
    expect(() => validateCreateTask(input)).toThrow('taskDate is required');
  });

  it('should reject invalid timeMode', () => {
    const input = { ...createTestCreateTaskRequest(), timeMode: 'flexible' };
    expect(() => validateCreateTask(input)).toThrow('timeMode must be one of');
  });

  it('should reject timed mode without startTime', () => {
    const input = createTestCreateTaskRequest({
      timeMode: 'timed',
      startTime: undefined,
    });
    expect(() => validateCreateTask(input)).toThrow(
      'startTime is required when timeMode is timed',
    );
  });

  it('should accept all_day mode without startTime', () => {
    const input = createTestCreateTaskRequest({
      timeMode: 'all_day',
      startTime: undefined,
    });
    const result = validateCreateTask(input);
    expect(result.timeMode).toBe('all_day');
  });

  it('should accept date_only mode without startTime', () => {
    const input = createTestCreateTaskRequest({
      timeMode: 'date_only',
      startTime: undefined,
    });
    const result = validateCreateTask(input);
    expect(result.timeMode).toBe('date_only');
  });

  it('should reject non-object metadata', () => {
    const input = { ...createTestCreateTaskRequest(), metadata: 'string' };
    expect(() => validateCreateTask(input)).toThrow(
      'metadata must be a plain object',
    );
  });

  it('should reject array metadata', () => {
    const input = { ...createTestCreateTaskRequest(), metadata: [1, 2] };
    expect(() => validateCreateTask(input)).toThrow(
      'metadata must be a plain object',
    );
  });

  it('should reject null metadata', () => {
    const input = { ...createTestCreateTaskRequest(), metadata: null };
    expect(() => validateCreateTask(input)).toThrow(
      'metadata must be a plain object',
    );
  });

  it('should accept valid metadata object', () => {
    const input = createTestCreateTaskRequest();
    (input as Record<string, unknown>).metadata = { notes: 'test' };
    const result = validateCreateTask(input);
    expect(result.metadata).toEqual({ notes: 'test' });
  });

  it('should accept all valid assignedTo values', () => {
    for (const person of ['Yogi', 'Riddhi', 'Both']) {
      const input = createTestCreateTaskRequest({ assignedTo: person });
      const result = validateCreateTask(input);
      expect(result.assignedTo).toBe(person);
    }
  });
});

// --- validateUpdateTask ---

describe('validateUpdateTask', () => {
  it('should accept a partial update', () => {
    const result = validateUpdateTask({ title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('should reject empty title', () => {
    expect(() => validateUpdateTask({ title: '' })).toThrow(
      'title must be a non-empty string',
    );
  });

  it('should reject invalid status', () => {
    expect(() => validateUpdateTask({ status: 'overdue' })).toThrow(
      'status must be one of',
    );
  });

  it('should reject invalid assignedTo', () => {
    expect(() => validateUpdateTask({ assignedTo: 'Nobody' })).toThrow(
      'assignedTo must be one of',
    );
  });

  it('should reject non-object metadata', () => {
    expect(() =>
      validateUpdateTask({
        metadata: 42 as unknown as Record<string, unknown>,
      }),
    ).toThrow('metadata must be a plain object');
  });

  it('should accept nullable fields', () => {
    const result = validateUpdateTask({
      startTime: null,
      endTime: null,
      location: null,
      description: null,
    });
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBeNull();
    expect(result.location).toBeNull();
    expect(result.description).toBeNull();
  });

  it('should accept an empty update body', () => {
    const result = validateUpdateTask({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// --- validateCreateCategory ---

describe('validateCreateCategory', () => {
  it('should return validated category for valid input', () => {
    const result = validateCreateCategory({
      name: 'Custom',
      slug: 'custom',
      colorKey: 'primary',
    });
    expect(result.name).toBe('Custom');
    expect(result.slug).toBe('custom');
    expect(result.colorKey).toBe('primary');
  });

  it('should reject missing name', () => {
    expect(() =>
      validateCreateCategory({ name: '', slug: 'x', colorKey: 'y' }),
    ).toThrow('name is required');
  });

  it('should reject missing slug', () => {
    expect(() =>
      validateCreateCategory({ name: 'X', slug: '', colorKey: 'y' }),
    ).toThrow('slug is required');
  });

  it('should reject missing colorKey', () => {
    expect(() =>
      validateCreateCategory({ name: 'X', slug: 'x', colorKey: '' }),
    ).toThrow('colorKey is required');
  });
});

// --- validateUpdateCategory ---

describe('validateUpdateCategory', () => {
  it('should accept partial updates', () => {
    const result = validateUpdateCategory({ name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('should reject empty name', () => {
    expect(() => validateUpdateCategory({ name: '' })).toThrow(
      'name must be a non-empty string',
    );
  });
});

// --- createTaskService ---

describe('createTaskService', () => {
  const category = createTestTaskCategory();
  const task = createTestTask();

  it('should create a one-time task with correct defaults', async () => {
    (getTaskCategoryById as jest.Mock).mockResolvedValue(category);
    (insertTask as jest.Mock).mockResolvedValue(task);

    const input = createTestCreateTaskRequest();
    const result = await createTaskService(input);

    expect(result).toEqual(task);
    expect(insertTask).toHaveBeenCalledWith(
      expect.objectContaining({
        series_id: null,
        original_occurrence_date: null,
        is_exception: false,
        status: 'planned',
        metadata: {},
      }),
    );
  });

  it('should throw if category does not exist', async () => {
    (getTaskCategoryById as jest.Mock).mockResolvedValue(undefined);

    const input = createTestCreateTaskRequest({ categoryId: 'missing' });
    await expect(createTaskService(input)).rejects.toThrow(
      'Category not found',
    );
    expect(insertTask).not.toHaveBeenCalled();
  });

  it('should pass through custom metadata', async () => {
    (getTaskCategoryById as jest.Mock).mockResolvedValue(category);
    (insertTask as jest.Mock).mockResolvedValue(task);

    const input = createTestCreateTaskRequest();
    input.metadata = { priority: 'high' };
    await createTaskService(input);

    expect(insertTask).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { priority: 'high' } }),
    );
  });
});

// --- updateTaskService ---

describe('updateTaskService', () => {
  const existingTask = createTestTask({ status: 'planned' });

  it('should update task fields', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);
    (updateTaskById as jest.Mock).mockResolvedValue({
      ...existingTask,
      title: 'Updated',
    });

    const result = await updateTaskService('task-1', { title: 'Updated' });

    expect(result.title).toBe('Updated');
    expect(updateTaskById).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({ title: 'Updated' }),
    );
  });

  it('should allow valid status transition: planned → completed', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);
    (updateTaskById as jest.Mock).mockResolvedValue({
      ...existingTask,
      status: 'completed',
    });

    const result = await updateTaskService('task-1', { status: 'completed' });
    expect(result.status).toBe('completed');
    expect(updateTaskById).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({
        status: 'completed',
        completed_at: expect.any(String),
      }),
    );
  });

  it('should allow valid status transition: planned → skipped', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);
    (updateTaskById as jest.Mock).mockResolvedValue({
      ...existingTask,
      status: 'skipped',
    });

    await updateTaskService('task-1', { status: 'skipped' });
    expect(updateTaskById).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({ status: 'skipped' }),
    );
  });

  it('should allow valid status transition: planned → canceled', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);
    (updateTaskById as jest.Mock).mockResolvedValue({
      ...existingTask,
      status: 'canceled',
    });

    await updateTaskService('task-1', { status: 'canceled' });
    expect(updateTaskById).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({
        status: 'canceled',
        canceled_at: expect.any(String),
      }),
    );
  });

  it('should allow valid status transition: skipped → planned', async () => {
    const skippedTask = createTestTask({ status: 'skipped' });
    (getTaskById as jest.Mock).mockResolvedValue(skippedTask);
    (updateTaskById as jest.Mock).mockResolvedValue({
      ...skippedTask,
      status: 'planned',
    });

    await updateTaskService('task-1', { status: 'planned' });
    expect(updateTaskById).toHaveBeenCalled();
  });

  it('should reject invalid status transition: completed → planned', async () => {
    const completedTask = createTestTask({ status: 'completed' });
    (getTaskById as jest.Mock).mockResolvedValue(completedTask);

    await expect(
      updateTaskService('task-1', { status: 'planned' }),
    ).rejects.toThrow('Cannot transition from completed to planned');
    expect(updateTaskById).not.toHaveBeenCalled();
  });

  it('should reject invalid status transition: canceled → planned', async () => {
    const canceledTask = createTestTask({ status: 'canceled' });
    (getTaskById as jest.Mock).mockResolvedValue(canceledTask);

    await expect(
      updateTaskService('task-1', { status: 'planned' }),
    ).rejects.toThrow('Cannot transition from canceled to planned');
  });

  it('should throw if task not found', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateTaskService('missing', { title: 'Nope' }),
    ).rejects.toThrow('Task not found');
  });

  it('should throw if changing to a non-existent category', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);
    (getTaskCategoryById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateTaskService('task-1', { categoryId: 'missing-cat' }),
    ).rejects.toThrow('Category not found');
  });

  it('should reject removing startTime when timeMode is timed', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(existingTask);

    await expect(
      updateTaskService('task-1', { startTime: null }),
    ).rejects.toThrow('startTime is required when timeMode is timed');
  });
});

// --- deleteTaskService ---

describe('deleteTaskService', () => {
  it('should soft-delete the task', async () => {
    (softDeleteTask as jest.Mock).mockResolvedValue(true);

    await deleteTaskService('task-1');
    expect(softDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('should throw if task not found', async () => {
    (softDeleteTask as jest.Mock).mockResolvedValue(false);

    await expect(deleteTaskService('missing')).rejects.toThrow(
      'Task not found',
    );
  });
});

// --- listTasksService ---

describe('listTasksService', () => {
  it('should pass date range and filters to DB helper', async () => {
    const tasks = [createTestTask()];
    (getTasksByDateRange as jest.Mock).mockResolvedValue(tasks);

    const result = await listTasksService(
      '2026-08-01',
      '2026-08-31',
      'planned',
      'Yogi',
    );

    expect(result).toEqual(tasks);
    expect(getTasksByDateRange).toHaveBeenCalledWith(
      '2026-08-01',
      '2026-08-31',
      'planned',
      'Yogi',
    );
  });
});

// --- getTaskByIdService ---

describe('getTaskByIdService', () => {
  it('should return a task by id', async () => {
    const task = createTestTask();
    (getTaskById as jest.Mock).mockResolvedValue(task);

    const result = await getTaskByIdService('task-1');
    expect(result).toEqual(task);
  });

  it('should return undefined for missing task', async () => {
    (getTaskById as jest.Mock).mockResolvedValue(undefined);

    const result = await getTaskByIdService('missing');
    expect(result).toBeUndefined();
  });
});

// --- listCategoriesService ---

describe('listCategoriesService', () => {
  it('should return all active categories', async () => {
    const categories = [createTestTaskCategory()];
    (getAllTaskCategories as jest.Mock).mockResolvedValue(categories);

    const result = await listCategoriesService();
    expect(result).toEqual(categories);
  });
});

// --- createCategoryService ---

describe('createCategoryService', () => {
  it('should map camelCase fields to snake_case for DB', async () => {
    const category = createTestTaskCategory();
    (insertTaskCategory as jest.Mock).mockResolvedValue(category);

    await createCategoryService({
      name: 'Work',
      slug: 'work',
      colorKey: 'primary',
      iconKey: 'briefcase',
      sortOrder: 1,
    });

    expect(insertTaskCategory).toHaveBeenCalledWith({
      name: 'Work',
      slug: 'work',
      color_key: 'primary',
      icon_key: 'briefcase',
      sort_order: 1,
    });
  });
});

// --- updateCategoryService ---

describe('updateCategoryService', () => {
  it('should throw if category not found', async () => {
    (getTaskCategoryById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateCategoryService('missing', { name: 'Nope' }),
    ).rejects.toThrow('Category not found');
  });

  it('should map camelCase to snake_case for update', async () => {
    const category = createTestTaskCategory();
    (getTaskCategoryById as jest.Mock).mockResolvedValue(category);
    (updateTaskCategory as jest.Mock).mockResolvedValue(category);

    await updateCategoryService('cat-1', {
      colorKey: 'secondary',
      isActive: false,
    });

    expect(updateTaskCategory).toHaveBeenCalledWith('cat-1', {
      color_key: 'secondary',
      is_active: false,
    });
  });
});
