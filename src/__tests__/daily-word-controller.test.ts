import request from 'supertest';
import { db, server, app } from '../server';
import { getWordOfTheDayService } from '../server/services/dailyWordService';
import { DailyWord } from '../server/utils/types';

jest.mock('../server/services/dailyWordService', () => ({
  getWordOfTheDayService: jest.fn(),
}));

afterAll(async () => {
  await db.destroy();
  server.close();
});

afterEach(() => {
  jest.clearAllMocks();
});

const dailyWord: DailyWord = {
  id: '1',
  wordnikId: 'wordnik-1',
  word: 'chandelle',
  displayDate: '2026-07-21',
  publishDate: '2026-07-21T03:00:00.000Z',
  providerName: 'wordnik',
  providerId: 711,
  note: null,
  htmlExtra: null,
  definitions: [],
  examples: [],
};

describe('GET /daily-word', () => {
  it('should return the word of the day', async () => {
    (getWordOfTheDayService as jest.Mock).mockResolvedValue(dailyWord);

    const response = await request(app).get('/daily-word');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(dailyWord);
  });

  it('should return a 500 error if the service throws', async () => {
    (getWordOfTheDayService as jest.Mock).mockRejectedValue(
      new Error('Wordnik is down'),
    );

    const response = await request(app).get('/daily-word');

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Wordnik is down');
  });
});
