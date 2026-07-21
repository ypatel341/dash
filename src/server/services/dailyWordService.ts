import dayjs from 'dayjs';
import { DailyWord } from '../utils/types';
import {
  getDailyWordByDisplayDate,
  insertDailyWord,
} from '../utils/db-operation-helpers';
import { fetchWordOfTheDay } from '../utils/wordnikClient';

export const getWordOfTheDayService = async (): Promise<DailyWord> => {
  const today = dayjs().format('YYYY-MM-DD');

  const existingWord = await getDailyWordByDisplayDate(today);
  if (existingWord) {
    return existingWord;
  }

  const wordnikResponse = await fetchWordOfTheDay();

  try {
    return await insertDailyWord(wordnikResponse, today);
  } catch (error) {
    // If another request inserted today's word concurrently, read it back instead of failing.
    const wordAfterInsertRace = await getDailyWordByDisplayDate(today);
    if (wordAfterInsertRace) {
      return wordAfterInsertRace;
    }
    throw error;
  }
};
