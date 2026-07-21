import dayjs from 'dayjs';
import { getWordOfTheDayService } from '../server/services/dailyWordService';
import {
  getDailyWordByDisplayDate,
  insertDailyWord,
} from '../server/utils/db-operation-helpers';
import { fetchWordOfTheDay } from '../server/utils/wordnikClient';
import { DailyWord, WordnikWordOfTheDayResponse } from '../server/utils/types';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getDailyWordByDisplayDate: jest.fn(),
  insertDailyWord: jest.fn(),
}));

jest.mock('../server/utils/wordnikClient', () => ({
  fetchWordOfTheDay: jest.fn(),
}));

const cachedWord: DailyWord = {
  id: '1',
  wordnikId: 'wordnik-1',
  word: 'chandelle',
  displayDate: dayjs().format('YYYY-MM-DD'),
  publishDate: '2026-07-21T03:00:00.000Z',
  providerName: 'wordnik',
  providerId: 711,
  note: null,
  htmlExtra: null,
  definitions: [],
  examples: [],
};

const wordnikResponse: WordnikWordOfTheDayResponse = {
  _id: 'wordnik-2',
  word: 'petrichor',
  publishDate: '2026-07-22T03:00:00.000Z',
  contentProvider: { name: 'wordnik', id: 711 },
  note: null,
  htmlExtra: null,
  pdd: dayjs().format('YYYY-MM-DD'),
  definitions: [],
  examples: [],
};

const insertedWord: DailyWord = {
  ...cachedWord,
  id: '2',
  wordnikId: 'wordnik-2',
  word: 'petrichor',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('getWordOfTheDayService', () => {
  it('should return the cached word for today without calling Wordnik', async () => {
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(cachedWord);

    const result = await getWordOfTheDayService();

    expect(result).toEqual(cachedWord);
    expect(getDailyWordByDisplayDate).toHaveBeenCalledWith(
      dayjs().format('YYYY-MM-DD'),
    );
    expect(fetchWordOfTheDay).not.toHaveBeenCalled();
    expect(insertDailyWord).not.toHaveBeenCalled();
  });

  it('should fetch from Wordnik and persist it when nothing is cached for today', async () => {
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(undefined);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(wordnikResponse);
    (insertDailyWord as jest.Mock).mockResolvedValue(insertedWord);

    const result = await getWordOfTheDayService();

    expect(fetchWordOfTheDay).toHaveBeenCalledTimes(1);
    expect(insertDailyWord).toHaveBeenCalledWith(
      wordnikResponse,
      dayjs().format('YYYY-MM-DD'),
    );
    expect(result).toEqual(insertedWord);
  });

  it('should propagate an error if the Wordnik fetch fails on a cache miss', async () => {
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(undefined);
    (fetchWordOfTheDay as jest.Mock).mockRejectedValue(
      new Error('Missing required environment variable: WORDNIK_API_KEY'),
    );

    await expect(getWordOfTheDayService()).rejects.toThrow(
      'Missing required environment variable: WORDNIK_API_KEY',
    );
    expect(insertDailyWord).not.toHaveBeenCalled();
  });
});
