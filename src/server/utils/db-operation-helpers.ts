import dayjs from 'dayjs';
import db from '../../config/db';
import logger from './logger';
import {
  BudgetType,
  CurrentYearlyAccumulatedData,
  DailyWord,
  InsertExpenseType,
  InsertResponseId,
  MonthlyExpense,
  MonthlyExpenseWithReimbursable,
  Task,
  TaskCategory,
  UpdateExpenseType,
  WordnikWordOfTheDayResponse,
} from './types';
import {
  ErrorFetchingBudgetData,
  ErrorFetchingDailyWord,
  ErrorFetchingTask,
  ErrorFetchingTaskCategories,
  ErrorInsertingDailyWord,
  ErrorInsertingExpense,
  ErrorInsertingTask,
  ErrorInsertingTaskCategory,
  ErrorUpdatingTask,
  ErrorUpdatingTaskCategory,
  ErrorDeletingTask,
} from './consts';
import { validateReimbursableExpense } from './utils';

export const getAllBudgetData = async (): Promise<BudgetType[]> => {
  try {
    const result = await db('budget_monthly_allocation').select('*');
    logger.info(`Fetching all budget data ${result}`);

    return result;
  } catch (err) {
    logger.error(`${ErrorFetchingBudgetData} ${err}`);
    throw err;
  }
};

export const insertExpense = async (
  expense: InsertExpenseType,
): Promise<InsertResponseId> => {
  let insertObj: InsertExpenseType = {
    person: expense.person,
    bucketname: expense.bucketname,
    vendor: expense.vendor,
    amount: expense.amount,
    description: expense.description,
  };

  if (expense.expensedate) {
    insertObj = {
      ...insertObj,
      expensedate: expense.expensedate,
    };
  }

  if (expense.expensable) {
    const { reimbursement } = expense;

    const validatedReimbursement =
      await validateReimbursableExpense(reimbursement);

    const { company, description } = validatedReimbursement;

    const expensableResult = await db('reimbursable_expenses')
      .insert({
        expensable_id: db.raw('gen_random_uuid()'),
        company: company,
        reimbursed: false,
        description,
      })
      .returning('expensable_id');

    const expensable_id = expensableResult[0].expensable_id;

    insertObj = {
      ...insertObj,
      expensable: expensable_id, // Use the extracted UUID
    };
  }

  try {
    const result = await db('budget_monthly_expenses')
      .insert(insertObj)
      .returning('id')
      .whereNull('deletedat');

    logger.info(`Inserted expense ${result[0]}`);

    return result[0];
  } catch (err) {
    logger.error(`Error inserting expense: ${err}`);
    throw err;
  }
};

export const getAllMonthlyExpense = async (): Promise<MonthlyExpense[]> => {
  try {
    const result: MonthlyExpense[] = await db('budget_monthly_expenses')
      .select('*')
      .where('expensedate', '>=', db.raw("date_trunc('month', CURRENT_DATE)"))
      .where(
        'expensedate',
        '<',
        db.raw("date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'"),
      )
      .whereNull('deletedat')
      .whereNull('expensable')
      .orderBy('expensedate', 'desc');

    logger.info(`Fetching all monthly expenses ${result}`);

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData} ${error}`);
    throw error;
  }
};

export const getAllMonthlyExpenseByMonth = async (
  yearMonth: string,
): Promise<MonthlyExpense[]> => {
  try {
    const yearMonthDay = `${yearMonth}-01`;

    logger.info(`Fetching expenses for the month: ${yearMonthDay}`);

    const result: MonthlyExpense[] = await db('budget_monthly_expenses')
      .select('*')
      .where('expensedate', '>=', db.raw('?', [yearMonthDay]))
      .where(
        'expensedate',
        '<',
        db.raw("?::date + INTERVAL '1 month'", [yearMonthDay]),
      )
      .whereNull('deletedat')
      .whereNull('expensable')
      .orderBy('expensedate', 'desc');

    logger.info(
      `Fetched ${result.length} monthly expenses for month: ${yearMonth}`,
    );

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData}: ${error}`);
    throw error;
  }
};

export const getAllMonthlyReimbursedExpenseByMonth = async (
  yearMonth: string,
): Promise<MonthlyExpenseWithReimbursable[]> => {
  try {
    const yearMonthDay = `${yearMonth}-01`;

    logger.info(`Fetching reimbursed expenses for the month: ${yearMonthDay}`);

    const result: MonthlyExpenseWithReimbursable[] = await db(
      'budget_monthly_expenses',
    )
      .select(
        'budget_monthly_expenses.*',
        'reimbursable_expenses.company',
        'reimbursable_expenses.description as reimbursementDescription',
      )
      .join(
        'reimbursable_expenses',
        'budget_monthly_expenses.expensable',
        'reimbursable_expenses.expensable_id',
      )
      .where('expensedate', '>=', db.raw('?', [yearMonthDay]))
      .where(
        'expensedate',
        '<',
        db.raw("?::date + INTERVAL '1 month'", [yearMonthDay]),
      )
      .whereNull('deletedat')
      .orderBy('expensedate', 'desc');

    logger.info(
      `Fetched ${result.length} reimbursed monthly expenses for month: ${yearMonth}`,
    );

    return result;
  } catch (error) {
    logger.error(`${ErrorFetchingBudgetData}: ${error}`);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await db('budget_monthly_expenses')
      .where({ id })
      .update({ deletedat: db.fn.now() });

    logger.info(`Deleted expense with id ${id}`);
  } catch (error) {
    logger.error(`${ErrorInsertingExpense} ${error}`);
    throw error;
  }
};

export const updateExpense = async (
  updateExpense: UpdateExpenseType,
): Promise<void> => {
  const { id } = updateExpense;

  try {
    await db('budget_monthly_expenses').where({ id: id }).update(updateExpense);
    logger.info(`Updated expense with id ${updateExpense.id}`);
  } catch (error) {
    logger.error(`${ErrorInsertingExpense} ${error}`);
    throw error;
  }
};

export const simpleSelect = async (): Promise<boolean> => {
  try {
    const response = await db.raw('select * from budget_monthly_allocation');
    logger.info(`Simple select response: ${JSON.stringify(response)}`);
    return true;
  } catch (error) {
    logger.error(`Error checking DB health: ${error}`);
    throw error;
  }
};

export const getDailyWordByDisplayDate = async (
  displayDate: string,
): Promise<DailyWord | undefined> => {
  try {
    const wordRow = await db('daily_words')
      .select('*')
      .where('display_date', displayDate)
      .first();

    if (!wordRow) {
      return undefined;
    }

    const [definitionRows, exampleRows] = await Promise.all([
      db('daily_word_definitions')
        .select('*')
        .where('daily_word_id', wordRow.id)
        .orderBy('display_order', 'asc'),
      db('daily_word_examples')
        .select('*')
        .where('daily_word_id', wordRow.id)
        .orderBy('display_order', 'asc'),
    ]);

    return formatDailyWordRow(wordRow, definitionRows, exampleRows);
  } catch (error) {
    logger.error(`${ErrorFetchingDailyWord}: ${error}`);
    throw error;
  }
};

export const insertDailyWord = async (
  payload: WordnikWordOfTheDayResponse,
  displayDate: string,
): Promise<DailyWord> => {
  try {
    return await db.transaction(async (trx) => {
      const [wordRow] = await trx('daily_words')
        .insert({
          wordnik_id: payload._id,
          word: payload.word,
          display_date: displayDate,
          publish_date: payload.publishDate,
          provider_name: payload.contentProvider?.name,
          provider_id: payload.contentProvider?.id ?? null,
          note: payload.note ?? null,
          html_extra: payload.htmlExtra ?? null,
          raw_payload: payload,
        })
        .returning('*');

      const definitionRows = payload.definitions?.length
        ? await trx('daily_word_definitions')
            .insert(
              payload.definitions.map((definition, index) => ({
                daily_word_id: wordRow.id,
                definition: definition.text,
                part_of_speech: definition.partOfSpeech ?? null,
                source: definition.source ?? null,
                note: definition.note ?? null,
                display_order: index,
              })),
            )
            .returning('*')
        : [];

      const exampleRows = payload.examples?.length
        ? await trx('daily_word_examples')
            .insert(
              payload.examples.map((example, index) => ({
                daily_word_id: wordRow.id,
                wordnik_example_id: example.id ?? null,
                example_text: example.text,
                title: example.title ?? null,
                source_url: example.url ?? null,
                display_order: index,
              })),
            )
            .returning('*')
        : [];

      logger.info(`Inserted daily word ${wordRow.word} for ${displayDate}`);

      return formatDailyWordRow(wordRow, definitionRows, exampleRows);
    });
  } catch (error) {
    logger.error(`${ErrorInsertingDailyWord}: ${error}`);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatDailyWordRow = (
  wordRow: any,
  definitionRows: any[],
  exampleRows: any[],
): DailyWord => ({
  id: wordRow.id,
  wordnikId: wordRow.wordnik_id,
  word: wordRow.word,
  displayDate: dayjs(wordRow.display_date).format('YYYY-MM-DD'),
  publishDate: dayjs(wordRow.publish_date).toISOString(),
  providerName: wordRow.provider_name,
  providerId: wordRow.provider_id,
  note: wordRow.note,
  htmlExtra: wordRow.html_extra,
  definitions: definitionRows.map((row) => ({
    definition: row.definition,
    partOfSpeech: row.part_of_speech,
    source: row.source,
    note: row.note,
    displayOrder: row.display_order,
  })),
  examples: exampleRows.map((row) => ({
    exampleText: row.example_text,
    title: row.title,
    sourceUrl: row.source_url,
    displayOrder: row.display_order,
  })),
});

export const getAccumulatedYearlyData = async (
  month: string,
): Promise<CurrentYearlyAccumulatedData[]> => {
  const year = month.split('-')[0];

  try {
    const result = await db('budget_monthly_expenses')
      .select('bucketname')
      .sum('amount as yearlyAccumulated')
      .where('expensedate', '>=', db.raw(`DATE '${year}-01-01'`))
      .where(
        'expensedate',
        '<',
        db.raw(`DATE '${month}-01' + INTERVAL '1 month'`),
      )
      .whereNull('deletedat')
      .whereNull('expensable')
      .groupBy('bucketname');

    logger.info(`Fetched accumulated yearly data for month: ${month}`);

    return result as CurrentYearlyAccumulatedData[];
  } catch (error) {
    logger.error(`Error fetching accumulated yearly data: ${error}`);
    throw error;
  }
};

// --- Task Category DB Operations ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTaskCategoryRow = (row: any): TaskCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  colorKey: row.color_key,
  iconKey: row.icon_key,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  createdAt: dayjs(row.created_at).toISOString(),
  updatedAt: dayjs(row.updated_at).toISOString(),
  deletedAt: row.deleted_at ? dayjs(row.deleted_at).toISOString() : null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTaskRow = (row: any): Task => ({
  id: row.id,
  assignedTo: row.assigned_to,
  seriesId: row.series_id,
  originalOccurrenceDate: row.original_occurrence_date
    ? dayjs(row.original_occurrence_date).format('YYYY-MM-DD')
    : null,
  title: row.title,
  description: row.description,
  categoryId: row.category_id,
  kind: row.kind,
  modality: row.modality,
  status: row.status,
  taskDate: dayjs(row.task_date).format('YYYY-MM-DD'),
  timeMode: row.time_mode,
  startTime: row.start_time,
  endTime: row.end_time,
  location: row.location,
  isException: row.is_exception,
  metadata: row.metadata,
  completedAt: row.completed_at ? dayjs(row.completed_at).toISOString() : null,
  canceledAt: row.canceled_at ? dayjs(row.canceled_at).toISOString() : null,
  createdAt: dayjs(row.created_at).toISOString(),
  updatedAt: dayjs(row.updated_at).toISOString(),
  deletedAt: row.deleted_at ? dayjs(row.deleted_at).toISOString() : null,
});

export const getAllTaskCategories = async (): Promise<TaskCategory[]> => {
  try {
    const rows = await db('task_categories')
      .select('*')
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('sort_order', 'asc');

    return rows.map(formatTaskCategoryRow);
  } catch (error) {
    logger.error(`${ErrorFetchingTaskCategories}: ${error}`);
    throw error;
  }
};

export const getTaskCategoryById = async (
  id: string,
): Promise<TaskCategory | undefined> => {
  try {
    const row = await db('task_categories')
      .select('*')
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    return row ? formatTaskCategoryRow(row) : undefined;
  } catch (error) {
    logger.error(`${ErrorFetchingTaskCategories}: ${error}`);
    throw error;
  }
};

export const insertTaskCategory = async (data: {
  name: string;
  slug: string;
  color_key: string;
  icon_key?: string;
  sort_order?: number;
}): Promise<TaskCategory> => {
  try {
    const [row] = await db('task_categories')
      .insert({
        name: data.name,
        slug: data.slug,
        color_key: data.color_key,
        icon_key: data.icon_key ?? null,
        sort_order: data.sort_order ?? 0,
      })
      .returning('*');

    logger.info(`Inserted task category ${row.slug}`);
    return formatTaskCategoryRow(row);
  } catch (error) {
    logger.error(`${ErrorInsertingTaskCategory}: ${error}`);
    throw error;
  }
};

export const updateTaskCategory = async (
  id: string,
  data: Record<string, unknown>,
): Promise<TaskCategory | undefined> => {
  try {
    const rows = await db('task_categories')
      .where('id', id)
      .whereNull('deleted_at')
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');

    if (!rows.length) return undefined;

    logger.info(`Updated task category ${id}`);
    return formatTaskCategoryRow(rows[0]);
  } catch (error) {
    logger.error(`${ErrorUpdatingTaskCategory}: ${error}`);
    throw error;
  }
};

// --- Task DB Operations ---

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    const row = await db('tasks')
      .select('*')
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    return row ? formatTaskRow(row) : undefined;
  } catch (error) {
    logger.error(`${ErrorFetchingTask}: ${error}`);
    throw error;
  }
};

export const getTasksByDateRange = async (
  from: string,
  to: string,
  status?: string,
  assignedTo?: string,
): Promise<Task[]> => {
  try {
    let query = db('tasks')
      .select('*')
      .where('task_date', '>=', from)
      .where('task_date', '<=', to)
      .whereNull('deleted_at')
      .orderBy('task_date', 'asc')
      .orderBy('start_time', 'asc');

    if (status) {
      query = query.where('status', status);
    }
    if (assignedTo) {
      query = query.where('assigned_to', assignedTo);
    }

    const rows = await query;
    return rows.map(formatTaskRow);
  } catch (error) {
    logger.error(`${ErrorFetchingTask}: ${error}`);
    throw error;
  }
};

export const insertTask = async (
  data: Record<string, unknown>,
): Promise<Task> => {
  try {
    const [row] = await db('tasks').insert(data).returning('*');

    logger.info(`Inserted task ${row.id}`);
    return formatTaskRow(row);
  } catch (error) {
    logger.error(`${ErrorInsertingTask}: ${error}`);
    throw error;
  }
};

export const updateTaskById = async (
  id: string,
  data: Record<string, unknown>,
): Promise<Task | undefined> => {
  try {
    const rows = await db('tasks')
      .where('id', id)
      .whereNull('deleted_at')
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');

    if (!rows.length) return undefined;

    logger.info(`Updated task ${id}`);
    return formatTaskRow(rows[0]);
  } catch (error) {
    logger.error(`${ErrorUpdatingTask}: ${error}`);
    throw error;
  }
};

export const softDeleteTask = async (id: string): Promise<boolean> => {
  try {
    const count = await db('tasks')
      .where('id', id)
      .whereNull('deleted_at')
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });

    logger.info(`Soft-deleted task ${id}`);
    return count > 0;
  } catch (error) {
    logger.error(`${ErrorDeletingTask}: ${error}`);
    throw error;
  }
};
