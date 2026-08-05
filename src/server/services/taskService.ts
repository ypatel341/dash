import {
  VALID_TASK_KINDS,
  VALID_TASK_MODALITIES,
  VALID_TASK_TIME_MODES,
  VALID_TASK_STATUSES,
  VALID_ASSIGNED_TO,
  VALID_STATUS_TRANSITIONS,
} from '../utils/consts';
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
} from '../utils/db-operation-helpers';
import { ensureOccurrencesForDateRange } from './seriesService';
import {
  Task,
  TaskCategory,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../utils/types';

// --- Validation ---

export const validateCreateTask = (body: unknown): CreateTaskRequest => {
  const data = body as Record<string, unknown>;

  if (!data.title || typeof data.title !== 'string') {
    throw new Error('title is required');
  }
  if (
    !data.assignedTo ||
    !(VALID_ASSIGNED_TO as readonly string[]).includes(
      data.assignedTo as string,
    )
  ) {
    throw new Error(
      `assignedTo must be one of: ${VALID_ASSIGNED_TO.join(', ')}`,
    );
  }
  if (!data.categoryId || typeof data.categoryId !== 'string') {
    throw new Error('categoryId is required');
  }
  if (
    !data.kind ||
    !(VALID_TASK_KINDS as readonly string[]).includes(data.kind as string)
  ) {
    throw new Error(`kind must be one of: ${VALID_TASK_KINDS.join(', ')}`);
  }
  if (
    !data.modality ||
    !(VALID_TASK_MODALITIES as readonly string[]).includes(
      data.modality as string,
    )
  ) {
    throw new Error(
      `modality must be one of: ${VALID_TASK_MODALITIES.join(', ')}`,
    );
  }
  if (!data.taskDate || typeof data.taskDate !== 'string') {
    throw new Error('taskDate is required');
  }
  if (
    !data.timeMode ||
    !(VALID_TASK_TIME_MODES as readonly string[]).includes(
      data.timeMode as string,
    )
  ) {
    throw new Error(
      `timeMode must be one of: ${VALID_TASK_TIME_MODES.join(', ')}`,
    );
  }
  if (data.timeMode === 'timed' && !data.startTime) {
    throw new Error('startTime is required when timeMode is timed');
  }
  if (
    data.metadata !== undefined &&
    (typeof data.metadata !== 'object' ||
      data.metadata === null ||
      Array.isArray(data.metadata))
  ) {
    throw new Error('metadata must be a plain object');
  }

  return {
    assignedTo: data.assignedTo as string,
    title: data.title as string,
    description: data.description as string | undefined,
    categoryId: data.categoryId as string,
    kind: data.kind as string,
    modality: data.modality as string,
    taskDate: data.taskDate as string,
    timeMode: data.timeMode as string,
    startTime: data.startTime as string | undefined,
    endTime: data.endTime as string | undefined,
    location: data.location as string | undefined,
    metadata: data.metadata as Record<string, unknown> | undefined,
  };
};

export const validateUpdateTask = (body: unknown): UpdateTaskRequest => {
  const data = body as Record<string, unknown>;
  const result: UpdateTaskRequest = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title) {
      throw new Error('title must be a non-empty string');
    }
    result.title = data.title;
  }
  if (data.assignedTo !== undefined) {
    if (
      !(VALID_ASSIGNED_TO as readonly string[]).includes(
        data.assignedTo as string,
      )
    ) {
      throw new Error(
        `assignedTo must be one of: ${VALID_ASSIGNED_TO.join(', ')}`,
      );
    }
    result.assignedTo = data.assignedTo as string;
  }
  if (data.categoryId !== undefined) {
    if (typeof data.categoryId !== 'string' || !data.categoryId) {
      throw new Error('categoryId must be a non-empty string');
    }
    result.categoryId = data.categoryId;
  }
  if (data.kind !== undefined) {
    if (
      !(VALID_TASK_KINDS as readonly string[]).includes(data.kind as string)
    ) {
      throw new Error(`kind must be one of: ${VALID_TASK_KINDS.join(', ')}`);
    }
    result.kind = data.kind as string;
  }
  if (data.modality !== undefined) {
    if (
      !(VALID_TASK_MODALITIES as readonly string[]).includes(
        data.modality as string,
      )
    ) {
      throw new Error(
        `modality must be one of: ${VALID_TASK_MODALITIES.join(', ')}`,
      );
    }
    result.modality = data.modality as string;
  }
  if (data.status !== undefined) {
    if (
      !(VALID_TASK_STATUSES as readonly string[]).includes(
        data.status as string,
      )
    ) {
      throw new Error(
        `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`,
      );
    }
    result.status = data.status as string;
  }
  if (data.taskDate !== undefined) {
    result.taskDate = data.taskDate as string;
  }
  if (data.timeMode !== undefined) {
    if (
      !(VALID_TASK_TIME_MODES as readonly string[]).includes(
        data.timeMode as string,
      )
    ) {
      throw new Error(
        `timeMode must be one of: ${VALID_TASK_TIME_MODES.join(', ')}`,
      );
    }
    result.timeMode = data.timeMode as string;
  }
  if ('startTime' in data)
    result.startTime = (data.startTime as string | null) ?? null;
  if ('endTime' in data)
    result.endTime = (data.endTime as string | null) ?? null;
  if ('location' in data)
    result.location = (data.location as string | null) ?? null;
  if ('description' in data)
    result.description = (data.description as string | null) ?? null;
  if (data.metadata !== undefined) {
    if (
      typeof data.metadata !== 'object' ||
      data.metadata === null ||
      Array.isArray(data.metadata)
    ) {
      throw new Error('metadata must be a plain object');
    }
    result.metadata = data.metadata as Record<string, unknown>;
  }

  return result;
};

export const validateCreateCategory = (
  body: unknown,
): CreateCategoryRequest => {
  const data = body as Record<string, unknown>;

  if (!data.name || typeof data.name !== 'string') {
    throw new Error('name is required');
  }
  if (!data.slug || typeof data.slug !== 'string') {
    throw new Error('slug is required');
  }
  if (!data.colorKey || typeof data.colorKey !== 'string') {
    throw new Error('colorKey is required');
  }

  return {
    name: data.name,
    slug: data.slug,
    colorKey: data.colorKey,
    iconKey: data.iconKey as string | undefined,
    sortOrder: data.sortOrder as number | undefined,
  };
};

export const validateUpdateCategory = (
  body: unknown,
): UpdateCategoryRequest => {
  const data = body as Record<string, unknown>;
  const result: UpdateCategoryRequest = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name) {
      throw new Error('name must be a non-empty string');
    }
    result.name = data.name;
  }
  if (data.colorKey !== undefined) result.colorKey = data.colorKey as string;
  if ('iconKey' in data)
    result.iconKey = (data.iconKey as string | null) ?? null;
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder as number;
  if (data.isActive !== undefined) result.isActive = data.isActive as boolean;

  return result;
};

// --- Category Service ---

export const listCategoriesService = async (): Promise<TaskCategory[]> => {
  return await getAllTaskCategories();
};

export const createCategoryService = async (
  data: CreateCategoryRequest,
): Promise<TaskCategory> => {
  return await insertTaskCategory({
    name: data.name,
    slug: data.slug,
    color_key: data.colorKey,
    icon_key: data.iconKey,
    sort_order: data.sortOrder,
  });
};

export const updateCategoryService = async (
  id: string,
  data: UpdateCategoryRequest,
): Promise<TaskCategory> => {
  const existing = await getTaskCategoryById(id);
  if (!existing) {
    throw new Error('Category not found');
  }

  const dbData: Record<string, unknown> = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.colorKey !== undefined) dbData.color_key = data.colorKey;
  if ('iconKey' in data) dbData.icon_key = data.iconKey;
  if (data.sortOrder !== undefined) dbData.sort_order = data.sortOrder;
  if (data.isActive !== undefined) dbData.is_active = data.isActive;

  const updated = await updateTaskCategory(id, dbData);
  if (!updated) {
    throw new Error('Category not found');
  }
  return updated;
};

// --- Task Service ---

export const getTaskByIdService = async (
  id: string,
): Promise<Task | undefined> => {
  return await getTaskById(id);
};

export const listTasksService = async (
  from: string,
  to: string,
  status?: string,
  assignedTo?: string,
): Promise<Task[]> => {
  await ensureOccurrencesForDateRange(from, to);
  return await getTasksByDateRange(from, to, status, assignedTo);
};

export const createTaskService = async (
  data: CreateTaskRequest,
): Promise<Task> => {
  const category = await getTaskCategoryById(data.categoryId);
  if (!category) {
    throw new Error(`Category not found: ${data.categoryId}`);
  }

  return await insertTask({
    assigned_to: data.assignedTo,
    title: data.title,
    description: data.description ?? null,
    category_id: data.categoryId,
    kind: data.kind,
    modality: data.modality,
    status: 'planned',
    task_date: data.taskDate,
    time_mode: data.timeMode,
    start_time: data.startTime ?? null,
    end_time: data.endTime ?? null,
    location: data.location ?? null,
    series_id: null,
    original_occurrence_date: null,
    is_exception: false,
    metadata: data.metadata ?? {},
  });
};

export const updateTaskService = async (
  id: string,
  data: UpdateTaskRequest,
): Promise<Task> => {
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error('Task not found');
  }

  if (data.status && data.status !== existing.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(data.status)) {
      throw new Error(
        `Cannot transition from ${existing.status} to ${data.status}`,
      );
    }
  }

  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const category = await getTaskCategoryById(data.categoryId);
    if (!category) {
      throw new Error(`Category not found: ${data.categoryId}`);
    }
  }

  const effectiveTimeMode = data.timeMode ?? existing.timeMode;
  const effectiveStartTime =
    'startTime' in data ? data.startTime : existing.startTime;
  if (effectiveTimeMode === 'timed' && !effectiveStartTime) {
    throw new Error('startTime is required when timeMode is timed');
  }

  const dbData: Record<string, unknown> = {};
  if (data.title !== undefined) dbData.title = data.title;
  if ('description' in data) dbData.description = data.description ?? null;
  if (data.assignedTo !== undefined) dbData.assigned_to = data.assignedTo;
  if (data.categoryId !== undefined) dbData.category_id = data.categoryId;
  if (data.kind !== undefined) dbData.kind = data.kind;
  if (data.modality !== undefined) dbData.modality = data.modality;
  if (data.taskDate !== undefined) dbData.task_date = data.taskDate;
  if (data.timeMode !== undefined) dbData.time_mode = data.timeMode;
  if ('startTime' in data) dbData.start_time = data.startTime ?? null;
  if ('endTime' in data) dbData.end_time = data.endTime ?? null;
  if ('location' in data) dbData.location = data.location ?? null;
  if (data.metadata !== undefined) dbData.metadata = data.metadata;

  if (data.status && data.status !== existing.status) {
    dbData.status = data.status;
    if (data.status === 'completed') {
      dbData.completed_at = new Date().toISOString();
    } else if (data.status === 'canceled') {
      dbData.canceled_at = new Date().toISOString();
    }
  }

  const isDataEdit = Object.keys(dbData).some(
    (k) => !['status', 'completed_at', 'canceled_at'].includes(k),
  );
  if (existing.seriesId && isDataEdit) {
    dbData.is_exception = true;
  }

  const updated = await updateTaskById(id, dbData);
  if (!updated) {
    throw new Error('Task not found');
  }
  return updated;
};

export const deleteTaskService = async (id: string): Promise<void> => {
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error('Task not found');
  }

  if (existing.seriesId) {
    const updated = await updateTaskById(id, {
      status: 'canceled',
      is_exception: true,
      canceled_at: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error('Task not found');
    }
  } else {
    const deleted = await softDeleteTask(id);
    if (!deleted) {
      throw new Error('Task not found');
    }
  }
};
