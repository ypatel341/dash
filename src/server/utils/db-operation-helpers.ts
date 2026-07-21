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
  UpdateExpenseType,
  WordnikWordOfTheDayResponse,
} from './types';
import {
  ErrorFetchingBudgetData,
  ErrorFetchingDailyWord,
  ErrorInsertingDailyWord,
  ErrorInsertingExpense,
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

    const result: MonthlyExpenseWithReimbursable[] = await db('budget_monthly_expenses')
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
}

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
          raw_payload: JSON.stringify(payload),
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
