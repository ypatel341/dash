import dayjs from 'dayjs';
import { DailyWord } from '../utils/types';
import {
  getDailyWordByDisplayDate,
  getDailyWordByWordnikId,
  insertDailyWord,
} from '../utils/db-operation-helpers';
import { fetchWordOfTheDay } from '../utils/wordnikClient';
import { ErrorUnexpectedDailyWordDuplicate } from '../utils/consts';
import logger from '../utils/logger';

export const getWordOfTheDayService = async (): Promise<DailyWord> => {
  const today = dayjs().format('YYYY-MM-DD');

  const existingWord = await getDailyWordByDisplayDate(today);
  if (existingWord) {
    return existingWord;
  }

  const wordnikResponse = await fetchWordOfTheDay();
  const displayDate = wordnikResponse.pdd;

  if (displayDate !== today) {
    const existingForDisplayDate = await getDailyWordByDisplayDate(displayDate);
    if (existingForDisplayDate) {
      return existingForDisplayDate;
    }
  }

  try {
    return await insertDailyWord(wordnikResponse, displayDate);
  } catch (error) {
    const wordAfterInsertRace = await getDailyWordByDisplayDate(displayDate);
    if (wordAfterInsertRace) {
      logger.info(
        `Daily word for ${displayDate} was inserted by a concurrent request; returning it instead of failing.`,
      );
      return wordAfterInsertRace;
    }

    const existingByWordnikId = await getDailyWordByWordnikId(
      wordnikResponse._id,
    );
    logger.error(
      `${ErrorUnexpectedDailyWordDuplicate}: wordnik_id=${wordnikResponse._id} attemptedDisplayDate=${displayDate} existingDisplayDate=${existingByWordnikId?.displayDate ?? 'unknown'}: ${error}`,
    );
    throw error;
  }
};
