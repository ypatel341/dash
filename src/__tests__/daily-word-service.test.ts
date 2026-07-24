import dayjs from 'dayjs';
import { getWordOfTheDayService } from '../server/services/dailyWordService';
import {
  getDailyWordByDisplayDate,
  getDailyWordByWordnikId,
  insertDailyWord,
} from '../server/utils/db-operation-helpers';
import { fetchWordOfTheDay } from '../server/utils/wordnikClient';
import { DailyWord, WordnikWordOfTheDayResponse } from '../server/utils/types';
import logger from '../server/utils/logger';

jest.mock('../server/utils/db-operation-helpers', () => ({
  getDailyWordByDisplayDate: jest.fn(),
  getDailyWordByWordnikId: jest.fn(),
  insertDailyWord: jest.fn(),
}));

jest.mock('../server/utils/wordnikClient', () => ({
  fetchWordOfTheDay: jest.fn(),
}));

const today = dayjs().format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

const cachedWord: DailyWord = {
  id: '1',
  wordnikId: 'wordnik-1',
  word: 'chandelle',
  displayDate: today,
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
  pdd: today,
  definitions: [],
  examples: [],
};

const insertedWord: DailyWord = {
  ...cachedWord,
  id: '2',
  wordnikId: 'wordnik-2',
  word: 'petrichor',
};

let loggerInfoSpy: jest.SpyInstance;
let loggerErrorSpy: jest.SpyInstance;

beforeEach(() => {
  loggerInfoSpy = jest
    .spyOn(logger, 'info')
    .mockImplementation(jest.fn() as never);
  loggerErrorSpy = jest
    .spyOn(logger, 'error')
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  jest.clearAllMocks();
  loggerInfoSpy.mockRestore();
  loggerErrorSpy.mockRestore();
});

describe('getWordOfTheDayService', () => {
  it('should return the cached word for today without calling Wordnik', async () => {
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(cachedWord);

    const result = await getWordOfTheDayService();

    expect(result).toEqual(cachedWord);
    expect(getDailyWordByDisplayDate).toHaveBeenCalledWith(today);
    expect(fetchWordOfTheDay).not.toHaveBeenCalled();
    expect(insertDailyWord).not.toHaveBeenCalled();
  });

  it("should fetch from Wordnik and persist it under Wordnik's pdd when nothing is cached for today", async () => {
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(undefined);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(wordnikResponse);
    (insertDailyWord as jest.Mock).mockResolvedValue(insertedWord);

    const result = await getWordOfTheDayService();

    expect(fetchWordOfTheDay).toHaveBeenCalledTimes(1);
    expect(insertDailyWord).toHaveBeenCalledWith(
      wordnikResponse,
      wordnikResponse.pdd,
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

  it("should reconcile against Wordnik's pdd when it lags the server's local date and return the word already stored under that date", async () => {
    const laggedResponse = { ...wordnikResponse, pdd: yesterday };
    (getDailyWordByDisplayDate as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ ...cachedWord, displayDate: yesterday });

    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(laggedResponse);

    const result = await getWordOfTheDayService();

    expect(getDailyWordByDisplayDate).toHaveBeenNthCalledWith(1, today);
    expect(getDailyWordByDisplayDate).toHaveBeenNthCalledWith(2, yesterday);
    expect(insertDailyWord).not.toHaveBeenCalled();
    expect(result).toEqual({ ...cachedWord, displayDate: yesterday });
  });

  it("should insert under Wordnik's pdd, not local today, when nothing exists yet for either date", async () => {
    const laggedResponse = { ...wordnikResponse, pdd: yesterday };
    (getDailyWordByDisplayDate as jest.Mock).mockResolvedValue(undefined);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(laggedResponse);
    (insertDailyWord as jest.Mock).mockResolvedValue(insertedWord);

    const result = await getWordOfTheDayService();

    expect(insertDailyWord).toHaveBeenCalledWith(laggedResponse, yesterday);
    expect(result).toEqual(insertedWord);
  });

  it('should read back the winning word if another request inserted it first (benign concurrent race)', async () => {
    (getDailyWordByDisplayDate as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(cachedWord);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(wordnikResponse);
    (insertDailyWord as jest.Mock).mockRejectedValue(
      new Error('duplicate key value violates unique constraint'),
    );

    const result = await getWordOfTheDayService();

    expect(getDailyWordByDisplayDate).toHaveBeenCalledTimes(2);
    expect(result).toEqual(cachedWord);
    expect(getDailyWordByWordnikId).not.toHaveBeenCalled();
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('inserted by a concurrent request'),
    );
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('should log an unexpected-duplicate error and rethrow when the wordnik_id already exists under a different display_date', async () => {
    (getDailyWordByDisplayDate as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(wordnikResponse);
    (insertDailyWord as jest.Mock).mockRejectedValue(
      new Error(
        'duplicate key value violates unique constraint "daily_words_wordnik_id_unique"',
      ),
    );
    (getDailyWordByWordnikId as jest.Mock).mockResolvedValue({
      ...cachedWord,
      wordnikId: wordnikResponse._id,
      displayDate: yesterday,
    });

    await expect(getWordOfTheDayService()).rejects.toThrow(
      'duplicate key value violates unique constraint',
    );

    expect(getDailyWordByWordnikId).toHaveBeenCalledWith(wordnikResponse._id);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unexpected daily word duplicate'),
    );
  });

  it('should propagate the insert error if both the retry read-back and the wordnik_id lookup find nothing', async () => {
    (getDailyWordByDisplayDate as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    (fetchWordOfTheDay as jest.Mock).mockResolvedValue(wordnikResponse);
    (insertDailyWord as jest.Mock).mockRejectedValue(
      new Error('connection terminated'),
    );
    (getDailyWordByWordnikId as jest.Mock).mockResolvedValue(undefined);

    await expect(getWordOfTheDayService()).rejects.toThrow(
      'connection terminated',
    );
    expect(getDailyWordByDisplayDate).toHaveBeenCalledTimes(2);
    expect(getDailyWordByWordnikId).toHaveBeenCalledWith(wordnikResponse._id);
  });
});
