import {
  Task,
  TaskCategory,
  CreateTaskRequest,
  CreateCategoryRequest,
} from '../types';

export const createTestTaskCategory = (
  overrides: Partial<TaskCategory> = {},
): TaskCategory => ({
  id: 'cat-1',
  name: 'Work',
  slug: 'work',
  colorKey: 'primary',
  iconKey: null,
  sortOrder: 1,
  isActive: true,
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

export const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  assignedTo: 'Yogi',
  seriesId: null,
  originalOccurrenceDate: null,
  title: 'Test Task',
  description: null,
  categoryId: 'cat-1',
  kind: 'event',
  modality: 'physical',
  status: 'planned',
  taskDate: '2026-08-01',
  timeMode: 'timed',
  startTime: '14:00:00',
  endTime: '15:00:00',
  location: null,
  isException: false,
  metadata: {},
  completedAt: null,
  canceledAt: null,
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

export const createTestCreateTaskRequest = (
  overrides: Partial<CreateTaskRequest> = {},
): CreateTaskRequest => ({
  assignedTo: 'Yogi',
  title: 'Test Task',
  categoryId: 'cat-1',
  kind: 'event',
  modality: 'physical',
  taskDate: '2026-08-01',
  timeMode: 'timed',
  startTime: '14:00',
  ...overrides,
});

export const createTestCreateCategoryRequest = (
  overrides: Partial<CreateCategoryRequest> = {},
): CreateCategoryRequest => ({
  name: 'Custom',
  slug: 'custom',
  colorKey: 'primary',
  ...overrides,
});
