import {
  validateCreateSeries,
  validateUpdateSeries,
  createSeriesService,
  updateSeriesService,
  pauseSeriesService,
  resumeSeriesService,
  archiveSeriesService,
  listSeriesService,
  getSeriesByIdService,
  ensureTaskOccurrences,
  ensureOccurrencesForDateRange,
} from '../server/services/seriesService';
import {
  getTaskCategoryById,
  getTaskSeriesById,
  getAllActiveTaskSeries,
  getSeriesNeedingMaterialization,
  insertTaskSeries,
  updateTaskSeriesById,
  getCanceledExceptionDates,
  materializeOccurrences,
} from '../server/utils/db-operation-helpers';
import { validateRRule, expandRRule } from '../server/utils/rruleHelper';
import {
  createTestTaskCategory,
  createTestTaskSeries,
  createTestCreateSeriesRequest,
  createTestRecurringTask,
} from '../server/utils/data-factory/taskTestDataFactory';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getTaskCategoryById: jest.fn(),
  getTaskSeriesById: jest.fn(),
  getAllActiveTaskSeries: jest.fn(),
  getSeriesNeedingMaterialization: jest.fn(),
  insertTaskSeries: jest.fn(),
  updateTaskSeriesById: jest.fn(),
  getCanceledExceptionDates: jest.fn(),
  materializeOccurrences: jest.fn(),
  updateFuturePlannedOccurrences: jest.fn().mockResolvedValue(0),
  deleteFuturePlannedOccurrences: jest.fn().mockResolvedValue(0),
}));

jest.mock('../server/utils/rruleHelper', () => ({
  validateRRule: jest.fn(),
  expandRRule: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

// --- validateCreateSeries ---

describe('validateCreateSeries', () => {
  it('should return a validated request for valid input', () => {
    const input = createTestCreateSeriesRequest();
    const result = validateCreateSeries(input);

    expect(result.title).toBe('Weekly Standup');
    expect(result.assignedTo).toBe('Yogi');
    expect(result.kind).toBe('event');
    expect(result.modality).toBe('virtual');
    expect(result.timeMode).toBe('timed');
    expect(result.startsOn).toBe('2026-08-01');
    expect(result.recurrenceRule).toBe('FREQ=WEEKLY;BYDAY=MO');
  });

  it('should reject missing title', () => {
    const input = createTestCreateSeriesRequest({ title: '' });
    expect(() => validateCreateSeries(input)).toThrow('title is required');
  });

  it('should reject invalid assignedTo', () => {
    const input = { ...createTestCreateSeriesRequest(), assignedTo: 'Nobody' };
    expect(() => validateCreateSeries(input)).toThrow(
      'assignedTo must be one of',
    );
  });

  it('should reject missing categoryId', () => {
    const input = { ...createTestCreateSeriesRequest(), categoryId: '' };
    expect(() => validateCreateSeries(input)).toThrow('categoryId is required');
  });

  it('should reject invalid kind', () => {
    const input = { ...createTestCreateSeriesRequest(), kind: 'reminder' };
    expect(() => validateCreateSeries(input)).toThrow('kind must be one of');
  });

  it('should reject invalid modality', () => {
    const input = { ...createTestCreateSeriesRequest(), modality: 'hybrid' };
    expect(() => validateCreateSeries(input)).toThrow(
      'modality must be one of',
    );
  });

  it('should reject invalid timeMode', () => {
    const input = {
      ...createTestCreateSeriesRequest(),
      timeMode: 'flexible',
    };
    expect(() => validateCreateSeries(input)).toThrow(
      'timeMode must be one of',
    );
  });

  it('should reject timed mode without startTime', () => {
    const input = createTestCreateSeriesRequest({
      timeMode: 'timed',
      startTime: undefined,
    });
    expect(() => validateCreateSeries(input)).toThrow(
      'startTime is required when timeMode is timed',
    );
  });

  it('should reject missing startsOn', () => {
    const input = { ...createTestCreateSeriesRequest(), startsOn: '' };
    expect(() => validateCreateSeries(input)).toThrow('startsOn is required');
  });

  it('should reject missing recurrenceRule', () => {
    const input = { ...createTestCreateSeriesRequest(), recurrenceRule: '' };
    expect(() => validateCreateSeries(input)).toThrow(
      'recurrenceRule is required',
    );
  });

  it('should call validateRRule on the recurrence rule', () => {
    const input = createTestCreateSeriesRequest();
    validateCreateSeries(input);
    expect(validateRRule).toHaveBeenCalledWith('FREQ=WEEKLY;BYDAY=MO');
  });

  it('should reject endsOn before startsOn', () => {
    const input = {
      ...createTestCreateSeriesRequest(),
      endsOn: '2026-07-01',
    };
    expect(() => validateCreateSeries(input)).toThrow(
      'endsOn must be on or after startsOn',
    );
  });

  it('should reject non-object metadata', () => {
    const input = { ...createTestCreateSeriesRequest(), metadata: 'string' };
    expect(() => validateCreateSeries(input)).toThrow(
      'metadata must be a plain object',
    );
  });

  it('should accept valid endsOn', () => {
    const input = {
      ...createTestCreateSeriesRequest(),
      endsOn: '2026-12-31',
    };
    const result = validateCreateSeries(input);
    expect(result.endsOn).toBe('2026-12-31');
  });
});

// --- validateUpdateSeries ---

describe('validateUpdateSeries', () => {
  it('should accept a partial update', () => {
    const result = validateUpdateSeries({ title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('should reject status field', () => {
    expect(() => validateUpdateSeries({ status: 'paused' })).toThrow(
      'status cannot be changed via update',
    );
  });

  it('should accept startsOn field', () => {
    const result = validateUpdateSeries({ startsOn: '2026-09-01' });
    expect(result.startsOn).toBe('2026-09-01');
  });

  it('should reject empty startsOn', () => {
    expect(() => validateUpdateSeries({ startsOn: '' })).toThrow(
      'startsOn must be a non-empty date string',
    );
  });

  it('should reject empty title', () => {
    expect(() => validateUpdateSeries({ title: '' })).toThrow(
      'title must be a non-empty string',
    );
  });

  it('should reject invalid assignedTo', () => {
    expect(() => validateUpdateSeries({ assignedTo: 'Nobody' })).toThrow(
      'assignedTo must be one of',
    );
  });

  it('should reject invalid kind', () => {
    expect(() => validateUpdateSeries({ kind: 'reminder' })).toThrow(
      'kind must be one of',
    );
  });

  it('should validate recurrenceRule if provided', () => {
    validateUpdateSeries({ recurrenceRule: 'FREQ=DAILY' });
    expect(validateRRule).toHaveBeenCalledWith('FREQ=DAILY');
  });

  it('should reject empty recurrenceRule', () => {
    expect(() => validateUpdateSeries({ recurrenceRule: '' })).toThrow(
      'recurrenceRule must be a non-empty string',
    );
  });

  it('should accept nullable fields', () => {
    const result = validateUpdateSeries({
      description: null,
      location: null,
      startTime: null,
      endTime: null,
      endsOn: null,
    });
    expect(result.description).toBeNull();
    expect(result.location).toBeNull();
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBeNull();
    expect(result.endsOn).toBeNull();
  });

  it('should accept an empty update body', () => {
    const result = validateUpdateSeries({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// --- listSeriesService ---

describe('listSeriesService', () => {
  it('should return all active series', async () => {
    const series = [createTestTaskSeries()];
    (getAllActiveTaskSeries as jest.Mock).mockResolvedValue(series);

    const result = await listSeriesService();
    expect(result).toEqual(series);
  });
});

// --- getSeriesByIdService ---

describe('getSeriesByIdService', () => {
  it('should return a series by id', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    const result = await getSeriesByIdService('series-1');
    expect(result).toEqual(series);
  });

  it('should return undefined if not found', async () => {
    (getTaskSeriesById as jest.Mock).mockResolvedValue(undefined);

    const result = await getSeriesByIdService('missing');
    expect(result).toBeUndefined();
  });
});

// --- createSeriesService ---

describe('createSeriesService', () => {
  it('should create a series and trigger materialization', async () => {
    const category = createTestTaskCategory();
    const series = createTestTaskSeries();
    const tasks = [createTestRecurringTask()];

    (getTaskCategoryById as jest.Mock).mockResolvedValue(category);
    (insertTaskSeries as jest.Mock).mockResolvedValue(series);
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue(['2026-08-04']);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue([]);
    (materializeOccurrences as jest.Mock).mockResolvedValue(tasks);

    const result = await createSeriesService(createTestCreateSeriesRequest());

    expect(result.series).toEqual(series);
    expect(result.tasks).toEqual(tasks);
    expect(insertTaskSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
      }),
    );
  });

  it('should reject non-existent category', async () => {
    (getTaskCategoryById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      createSeriesService(createTestCreateSeriesRequest()),
    ).rejects.toThrow('Category not found');
  });

  it('should map camelCase to snake_case for insert', async () => {
    const category = createTestTaskCategory();
    const series = createTestTaskSeries();

    (getTaskCategoryById as jest.Mock).mockResolvedValue(category);
    (insertTaskSeries as jest.Mock).mockResolvedValue(series);
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue([]);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await createSeriesService(createTestCreateSeriesRequest());

    expect(insertTaskSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        assigned_to: 'Yogi',
        category_id: 'cat-1',
        time_mode: 'timed',
        start_time: '09:00',
        starts_on: '2026-08-01',
      }),
    );
  });
});

// --- updateSeriesService ---

describe('updateSeriesService', () => {
  it('should update series fields', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue({
      ...series,
      title: 'Updated',
    });

    const result = await updateSeriesService('series-1', {
      title: 'Updated',
    });
    expect(result.title).toBe('Updated');
  });

  it('should throw if series not found', async () => {
    (getTaskSeriesById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateSeriesService('missing', { title: 'Nope' }),
    ).rejects.toThrow('Series not found');
  });

  it('should verify new category exists when changing categoryId', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (getTaskCategoryById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateSeriesService('series-1', { categoryId: 'cat-999' }),
    ).rejects.toThrow('Category not found');
  });

  it('should reject removing startTime when timeMode is timed', async () => {
    const series = createTestTaskSeries({ timeMode: 'timed' });
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await expect(
      updateSeriesService('series-1', { startTime: null }),
    ).rejects.toThrow('startTime is required when timeMode is timed');
  });

  it('should map camelCase to snake_case for update', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (getSeriesNeedingMaterialization as jest.Mock).mockResolvedValue([]);

    await updateSeriesService('series-1', {
      recurrenceRule: 'FREQ=DAILY',
      endTime: null,
    });

    expect(updateTaskSeriesById).toHaveBeenCalledWith('series-1', {
      recurrence_rule: 'FREQ=DAILY',
      end_time: null,
    });
  });

  it('should reconcile future occurrences on field update', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue({
      ...series,
      title: 'Updated',
    });

    await updateSeriesService('series-1', { title: 'Updated' });

    const { updateFuturePlannedOccurrences } =
      jest.requireMock('../server/utils/db-operation-helpers');
    expect(updateFuturePlannedOccurrences).toHaveBeenCalledWith('series-1', {
      title: 'Updated',
    });
  });

  it('should delete and re-materialize on schedule change', async () => {
    const series = createTestTaskSeries();
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (getSeriesNeedingMaterialization as jest.Mock).mockResolvedValue([]);

    await updateSeriesService('series-1', { startsOn: '2026-09-01' });

    const { deleteFuturePlannedOccurrences } =
      jest.requireMock('../server/utils/db-operation-helpers');
    expect(deleteFuturePlannedOccurrences).toHaveBeenCalledWith('series-1');
    expect(updateTaskSeriesById).toHaveBeenCalledWith('series-1', {
      generated_through: null,
    });
  });
});

// --- pauseSeriesService ---

describe('pauseSeriesService', () => {
  it('should pause an active series', async () => {
    const series = createTestTaskSeries({ status: 'active' });
    const paused = { ...series, status: 'paused' };
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(paused);

    const result = await pauseSeriesService('series-1');
    expect(result.status).toBe('paused');
    expect(updateTaskSeriesById).toHaveBeenCalledWith('series-1', {
      status: 'paused',
    });
  });

  it('should throw if series not found', async () => {
    (getTaskSeriesById as jest.Mock).mockResolvedValue(undefined);

    await expect(pauseSeriesService('missing')).rejects.toThrow(
      'Series not found',
    );
  });

  it('should reject invalid transition', async () => {
    const series = createTestTaskSeries({ status: 'archived' });
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await expect(pauseSeriesService('series-1')).rejects.toThrow(
      'Cannot transition from archived to paused',
    );
  });
});

// --- resumeSeriesService ---

describe('resumeSeriesService', () => {
  it('should resume a paused series and trigger materialization', async () => {
    const series = createTestTaskSeries({ status: 'paused' });
    const active = { ...series, status: 'active' };
    const tasks = [createTestRecurringTask()];

    (getTaskSeriesById as jest.Mock)
      .mockResolvedValueOnce(series)
      .mockResolvedValueOnce(active);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(active);
    (expandRRule as jest.Mock).mockReturnValue(['2026-08-04']);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue([]);
    (materializeOccurrences as jest.Mock).mockResolvedValue(tasks);

    const result = await resumeSeriesService('series-1');
    expect(result.series.status).toBe('active');
    expect(result.tasks).toEqual(tasks);
  });

  it('should throw if series not found', async () => {
    (getTaskSeriesById as jest.Mock).mockResolvedValue(undefined);

    await expect(resumeSeriesService('missing')).rejects.toThrow(
      'Series not found',
    );
  });

  it('should reject invalid transition', async () => {
    const series = createTestTaskSeries({ status: 'active' });
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await expect(resumeSeriesService('series-1')).rejects.toThrow(
      'Cannot transition from active to active',
    );
  });
});

// --- archiveSeriesService ---

describe('archiveSeriesService', () => {
  it('should archive an active series', async () => {
    const series = createTestTaskSeries({ status: 'active' });
    const archived = { ...series, status: 'archived' };
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(archived);

    const result = await archiveSeriesService('series-1');
    expect(result.status).toBe('archived');
  });

  it('should archive a paused series', async () => {
    const series = createTestTaskSeries({ status: 'paused' });
    const archived = { ...series, status: 'archived' };
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(archived);

    const result = await archiveSeriesService('series-1');
    expect(result.status).toBe('archived');
  });

  it('should reject archiving an already archived series', async () => {
    const series = createTestTaskSeries({ status: 'archived' });
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await expect(archiveSeriesService('series-1')).rejects.toThrow(
      'Cannot transition from archived to archived',
    );
  });
});

// --- ensureTaskOccurrences ---

describe('ensureTaskOccurrences', () => {
  it('should generate tasks for a date range', async () => {
    const series = createTestTaskSeries({
      generatedThrough: null,
    });
    const tasks = [createTestRecurringTask()];

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue(['2026-08-04', '2026-08-11']);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue([]);
    (materializeOccurrences as jest.Mock).mockResolvedValue(tasks);

    const result = await ensureTaskOccurrences('series-1', '2026-10-29');

    expect(expandRRule).toHaveBeenCalledWith(
      'FREQ=WEEKLY;BYDAY=MO',
      '2026-08-01',
      '2026-07-31',
      '2026-10-29',
      null,
    );
    expect(materializeOccurrences).toHaveBeenCalledWith(
      'series-1',
      expect.arrayContaining([
        expect.objectContaining({
          series_id: 'series-1',
          original_occurrence_date: '2026-08-04',
          title: 'Weekly Standup',
          status: 'planned',
          is_exception: false,
        }),
      ]),
      '2026-10-29',
    );
    expect(result).toEqual(tasks);
  });

  it('should return empty array for paused series', async () => {
    const series = createTestTaskSeries({ status: 'paused' });
    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    const result = await ensureTaskOccurrences('series-1', '2026-10-29');
    expect(result).toEqual([]);
    expect(expandRRule).not.toHaveBeenCalled();
  });

  it('should return empty array for non-existent series', async () => {
    (getTaskSeriesById as jest.Mock).mockResolvedValue(undefined);

    const result = await ensureTaskOccurrences('missing', '2026-10-29');
    expect(result).toEqual([]);
  });

  it('should skip canceled exception dates', async () => {
    const series = createTestTaskSeries({ generatedThrough: null });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue([
      '2026-08-04',
      '2026-08-11',
      '2026-08-18',
    ]);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue(['2026-08-11']);
    (materializeOccurrences as jest.Mock).mockResolvedValue([]);

    await ensureTaskOccurrences('series-1', '2026-10-29');

    const taskRows = (materializeOccurrences as jest.Mock).mock.calls[0][1];
    const dates = taskRows.map(
      (r: Record<string, unknown>) => r.original_occurrence_date,
    );
    expect(dates).toContain('2026-08-04');
    expect(dates).not.toContain('2026-08-11');
    expect(dates).toContain('2026-08-18');
  });

  it('should use generatedThrough as after date for incremental fill', async () => {
    const series = createTestTaskSeries({
      generatedThrough: '2026-09-15',
    });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue(['2026-09-22']);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue([]);
    (materializeOccurrences as jest.Mock).mockResolvedValue([]);

    await ensureTaskOccurrences('series-1', '2026-10-29');

    expect(expandRRule).toHaveBeenCalledWith(
      'FREQ=WEEKLY;BYDAY=MO',
      '2026-08-01',
      '2026-09-15',
      '2026-10-29',
      null,
    );
  });

  it('should respect endsOn as effective end boundary', async () => {
    const series = createTestTaskSeries({
      generatedThrough: null,
      endsOn: '2026-09-01',
    });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue([]);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await ensureTaskOccurrences('series-1', '2026-10-29');

    expect(expandRRule).toHaveBeenCalledWith(
      'FREQ=WEEKLY;BYDAY=MO',
      '2026-08-01',
      '2026-07-31',
      '2026-09-01',
      '2026-09-01',
    );
  });

  it('should return empty when nothing to generate', async () => {
    const series = createTestTaskSeries({
      generatedThrough: '2026-10-30',
    });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);

    const result = await ensureTaskOccurrences('series-1', '2026-10-29');
    expect(result).toEqual([]);
    expect(expandRRule).not.toHaveBeenCalled();
  });

  it('should update generated_through when expansion returns no dates', async () => {
    const series = createTestTaskSeries({ generatedThrough: null });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue([]);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(series);

    await ensureTaskOccurrences('series-1', '2026-10-29');

    expect(updateTaskSeriesById).toHaveBeenCalledWith('series-1', {
      generated_through: '2026-10-29',
    });
  });

  it('should snapshot series defaults into task rows', async () => {
    const series = createTestTaskSeries({
      generatedThrough: null,
      title: 'Team Sync',
      description: 'Weekly team meeting',
      kind: 'event',
      modality: 'virtual',
      timeMode: 'timed',
      startTime: '09:00:00',
      endTime: '09:30:00',
      location: 'https://zoom.us/123',
      metadata: { room: 'A' },
    });

    (getTaskSeriesById as jest.Mock).mockResolvedValue(series);
    (expandRRule as jest.Mock).mockReturnValue(['2026-08-04']);
    (getCanceledExceptionDates as jest.Mock).mockResolvedValue([]);
    (materializeOccurrences as jest.Mock).mockResolvedValue([]);

    await ensureTaskOccurrences('series-1', '2026-10-29');

    const taskRows = (materializeOccurrences as jest.Mock).mock.calls[0][1];
    expect(taskRows[0]).toEqual(
      expect.objectContaining({
        title: 'Team Sync',
        description: 'Weekly team meeting',
        kind: 'event',
        modality: 'virtual',
        time_mode: 'timed',
        start_time: '09:00:00',
        end_time: '09:30:00',
        location: 'https://zoom.us/123',
        metadata: { room: 'A' },
        status: 'planned',
        is_exception: false,
        assigned_to: 'Yogi',
        category_id: 'cat-1',
        series_id: 'series-1',
        task_date: '2026-08-04',
        original_occurrence_date: '2026-08-04',
      }),
    );
  });
});

// --- ensureOccurrencesForDateRange ---

describe('ensureOccurrencesForDateRange', () => {
  it('should materialize each qualifying series', async () => {
    const s1 = createTestTaskSeries({ id: 'series-1' });
    const s2 = createTestTaskSeries({ id: 'series-2' });

    (getSeriesNeedingMaterialization as jest.Mock).mockResolvedValue([s1, s2]);
    (getTaskSeriesById as jest.Mock).mockResolvedValue(
      createTestTaskSeries({ status: 'active' }),
    );
    (expandRRule as jest.Mock).mockReturnValue([]);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(
      createTestTaskSeries(),
    );

    await ensureOccurrencesForDateRange('2026-08-01', '2026-10-29');

    expect(getSeriesNeedingMaterialization).toHaveBeenCalledWith('2026-10-29');
  });

  it('should continue on individual series error', async () => {
    const s1 = createTestTaskSeries({ id: 'series-1' });
    const s2 = createTestTaskSeries({ id: 'series-2' });

    (getSeriesNeedingMaterialization as jest.Mock).mockResolvedValue([s1, s2]);
    (getTaskSeriesById as jest.Mock)
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce(
        createTestTaskSeries({ id: 'series-2', status: 'active' }),
      );
    (expandRRule as jest.Mock).mockReturnValue([]);
    (updateTaskSeriesById as jest.Mock).mockResolvedValue(
      createTestTaskSeries(),
    );

    await expect(
      ensureOccurrencesForDateRange('2026-08-01', '2026-10-29'),
    ).resolves.not.toThrow();
  });

  it('should do nothing when no series need materialization', async () => {
    (getSeriesNeedingMaterialization as jest.Mock).mockResolvedValue([]);

    await ensureOccurrencesForDateRange('2026-08-01', '2026-10-29');

    expect(getTaskSeriesById).not.toHaveBeenCalled();
  });
});
