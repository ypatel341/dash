import dayjs from 'dayjs';
import logger from '../utils/logger';
import {
  VALID_TASK_KINDS,
  VALID_TASK_MODALITIES,
  VALID_TASK_TIME_MODES,
  VALID_ASSIGNED_TO,
  VALID_SERIES_STATUS_TRANSITIONS,
  DEFAULT_MATERIALIZATION_HORIZON_DAYS,
} from '../utils/consts';
import {
  getTaskCategoryById,
  getTaskSeriesById,
  getAllActiveTaskSeries,
  getSeriesNeedingMaterialization,
  insertTaskSeries,
  updateTaskSeriesById,
  getCanceledExceptionDates,
  materializeOccurrences,
} from '../utils/db-operation-helpers';
import { validateRRule, expandRRule } from '../utils/rruleHelper';
import {
  Task,
  TaskSeries,
  CreateSeriesRequest,
  UpdateSeriesRequest,
} from '../utils/types';

// --- Validation ---

export const validateCreateSeries = (body: unknown): CreateSeriesRequest => {
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
  if (!data.startsOn || typeof data.startsOn !== 'string') {
    throw new Error('startsOn is required');
  }
  if (!data.recurrenceRule || typeof data.recurrenceRule !== 'string') {
    throw new Error('recurrenceRule is required');
  }
  validateRRule(data.recurrenceRule);

  if (data.endsOn !== undefined && data.endsOn !== null) {
    if (typeof data.endsOn !== 'string' || !data.endsOn) {
      throw new Error('endsOn must be a non-empty string');
    }
    if (data.endsOn < (data.startsOn as string)) {
      throw new Error('endsOn must be on or after startsOn');
    }
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
    location: data.location as string | undefined,
    timeMode: data.timeMode as string,
    startTime: data.startTime as string | undefined,
    endTime: data.endTime as string | undefined,
    startsOn: data.startsOn as string,
    endsOn: data.endsOn as string | undefined,
    recurrenceRule: data.recurrenceRule as string,
    metadata: data.metadata as Record<string, unknown> | undefined,
  };
};

export const validateUpdateSeries = (body: unknown): UpdateSeriesRequest => {
  const data = body as Record<string, unknown>;
  const result: UpdateSeriesRequest = {};

  if ('status' in data) {
    throw new Error(
      'status cannot be changed via update; use action endpoints',
    );
  }
  if ('startsOn' in data) {
    throw new Error('startsOn cannot be changed after creation');
  }

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
  if (data.recurrenceRule !== undefined) {
    if (typeof data.recurrenceRule !== 'string' || !data.recurrenceRule) {
      throw new Error('recurrenceRule must be a non-empty string');
    }
    validateRRule(data.recurrenceRule);
    result.recurrenceRule = data.recurrenceRule;
  }
  if ('endsOn' in data) {
    result.endsOn = (data.endsOn as string | null) ?? null;
  }
  if ('description' in data) {
    result.description = (data.description as string | null) ?? null;
  }
  if ('location' in data) {
    result.location = (data.location as string | null) ?? null;
  }
  if ('startTime' in data) {
    result.startTime = (data.startTime as string | null) ?? null;
  }
  if ('endTime' in data) {
    result.endTime = (data.endTime as string | null) ?? null;
  }
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

// --- Series CRUD ---

export const listSeriesService = async (): Promise<TaskSeries[]> => {
  return await getAllActiveTaskSeries();
};

export const getSeriesByIdService = async (
  id: string,
): Promise<TaskSeries | undefined> => {
  return await getTaskSeriesById(id);
};

export const createSeriesService = async (
  data: CreateSeriesRequest,
): Promise<{ series: TaskSeries; tasks: Task[] }> => {
  const category = await getTaskCategoryById(data.categoryId);
  if (!category) {
    throw new Error(`Category not found: ${data.categoryId}`);
  }

  const series = await insertTaskSeries({
    assigned_to: data.assignedTo,
    title: data.title,
    description: data.description ?? null,
    category_id: data.categoryId,
    kind: data.kind,
    modality: data.modality,
    location: data.location ?? null,
    time_mode: data.timeMode,
    start_time: data.startTime ?? null,
    end_time: data.endTime ?? null,
    starts_on: data.startsOn,
    ends_on: data.endsOn ?? null,
    recurrence_rule: data.recurrenceRule,
    status: 'active',
    metadata: data.metadata ?? {},
  });

  const horizonDate = dayjs()
    .add(DEFAULT_MATERIALIZATION_HORIZON_DAYS, 'day')
    .format('YYYY-MM-DD');
  const tasks = await ensureTaskOccurrences(series.id, horizonDate);

  return { series, tasks };
};

export const updateSeriesService = async (
  id: string,
  data: UpdateSeriesRequest,
): Promise<TaskSeries> => {
  const existing = await getTaskSeriesById(id);
  if (!existing) {
    throw new Error('Series not found');
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
  if (data.timeMode !== undefined) dbData.time_mode = data.timeMode;
  if ('startTime' in data) dbData.start_time = data.startTime ?? null;
  if ('endTime' in data) dbData.end_time = data.endTime ?? null;
  if ('location' in data) dbData.location = data.location ?? null;
  if ('endsOn' in data) dbData.ends_on = data.endsOn ?? null;
  if (data.recurrenceRule !== undefined)
    dbData.recurrence_rule = data.recurrenceRule;
  if (data.metadata !== undefined) dbData.metadata = data.metadata;

  const updated = await updateTaskSeriesById(id, dbData);
  if (!updated) {
    throw new Error('Series not found');
  }
  return updated;
};

// --- Series Actions ---

export const pauseSeriesService = async (id: string): Promise<TaskSeries> => {
  const existing = await getTaskSeriesById(id);
  if (!existing) {
    throw new Error('Series not found');
  }

  const allowed = VALID_SERIES_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('paused')) {
    throw new Error(`Cannot transition from ${existing.status} to paused`);
  }

  const updated = await updateTaskSeriesById(id, { status: 'paused' });
  if (!updated) {
    throw new Error('Series not found');
  }
  return updated;
};

export const resumeSeriesService = async (
  id: string,
): Promise<{ series: TaskSeries; tasks: Task[] }> => {
  const existing = await getTaskSeriesById(id);
  if (!existing) {
    throw new Error('Series not found');
  }

  const allowed = VALID_SERIES_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('active')) {
    throw new Error(`Cannot transition from ${existing.status} to active`);
  }

  const updated = await updateTaskSeriesById(id, { status: 'active' });
  if (!updated) {
    throw new Error('Series not found');
  }

  const horizonDate = dayjs()
    .add(DEFAULT_MATERIALIZATION_HORIZON_DAYS, 'day')
    .format('YYYY-MM-DD');
  const tasks = await ensureTaskOccurrences(updated.id, horizonDate);

  return { series: updated, tasks };
};

export const archiveSeriesService = async (id: string): Promise<TaskSeries> => {
  const existing = await getTaskSeriesById(id);
  if (!existing) {
    throw new Error('Series not found');
  }

  const allowed = VALID_SERIES_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('archived')) {
    throw new Error(`Cannot transition from ${existing.status} to archived`);
  }

  const updated = await updateTaskSeriesById(id, { status: 'archived' });
  if (!updated) {
    throw new Error('Series not found');
  }
  return updated;
};

// --- Materialization ---

export const ensureTaskOccurrences = async (
  seriesId: string,
  throughDate: string,
): Promise<Task[]> => {
  const series = await getTaskSeriesById(seriesId);
  if (!series || series.status !== 'active') {
    return [];
  }

  // effectiveStart is exclusive — subtract 1 day from startsOn so startsOn itself is included
  const effectiveStart = series.generatedThrough
    ? series.generatedThrough
    : dayjs(series.startsOn).subtract(1, 'day').format('YYYY-MM-DD');

  const effectiveEnd =
    series.endsOn && series.endsOn < throughDate ? series.endsOn : throughDate;

  if (effectiveStart >= effectiveEnd) {
    return [];
  }

  const dates = expandRRule(
    series.recurrenceRule,
    series.startsOn,
    effectiveStart,
    effectiveEnd,
    series.endsOn,
  );

  if (dates.length === 0) {
    await updateTaskSeriesById(seriesId, {
      generated_through: effectiveEnd,
    });
    return [];
  }

  const canceledDates = await getCanceledExceptionDates(seriesId);
  const canceledSet = new Set(canceledDates);
  const filteredDates = dates.filter((d) => !canceledSet.has(d));

  if (filteredDates.length === 0) {
    await updateTaskSeriesById(seriesId, {
      generated_through: effectiveEnd,
    });
    return [];
  }

  const taskRows = filteredDates.map((date) => ({
    assigned_to: series.assignedTo,
    series_id: series.id,
    original_occurrence_date: date,
    title: series.title,
    description: series.description,
    category_id: series.categoryId,
    kind: series.kind,
    modality: series.modality,
    status: 'planned',
    task_date: date,
    time_mode: series.timeMode,
    start_time: series.startTime,
    end_time: series.endTime,
    location: series.location,
    is_exception: false,
    metadata: series.metadata,
  }));

  return await materializeOccurrences(seriesId, taskRows, effectiveEnd);
};

export const ensureOccurrencesForDateRange = async (
  _from: string,
  to: string,
): Promise<void> => {
  const seriesList = await getSeriesNeedingMaterialization(to);

  for (const series of seriesList) {
    try {
      await ensureTaskOccurrences(series.id, to);
    } catch (error) {
      logger.error(
        `Failed to materialize occurrences for series ${series.id}: ${error}`,
      );
    }
  }
};
