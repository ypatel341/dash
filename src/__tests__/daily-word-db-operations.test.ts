import { db, server } from '../server';
import {
  getDailyWordByDisplayDate,
  insertDailyWord,
} from '../server/utils/db-operation-helpers';
import { WordnikWordOfTheDayResponse } from '../server/utils/types';

describe('daily word DB operations', () => {
  const displayDate = '2099-01-01';
  const noRowDisplayDate = '2099-12-31';

  const fixturePayload: WordnikWordOfTheDayResponse = {
    _id: 'test-wordnik-id-chandelle',
    word: 'chandelle',
    publishDate: '2099-01-01T03:00:00.000Z',
    contentProvider: { name: 'wordnik', id: 711 },
    note: 'A test note about chandelle.',
    htmlExtra: null,
    pdd: displayDate,
    definitions: [
      {
        text: 'A sudden, steep climbing turn of an aircraft.',
        partOfSpeech: 'noun',
        source: 'ahd-legacy',
        note: null,
      },
      {
        text: 'To execute a chandelle.',
        partOfSpeech: 'verb-intransitive',
        source: 'ahd-legacy',
        note: null,
      },
    ],
    examples: [
      {
        id: 1039329183,
        url: 'https://books.google.com/books/about/On_Yankee_Station.html',
        text: 'Recovering on a reciprocal heading, the Spad pilot added power, climbing into a chandelle.',
        title: 'On Yankee Station',
      },
      {
        id: 706250586,
        url: 'http://books.simonandschuster.com/9781439140048',
        text: 'She was either using too much rudder in her chandelle maneuvers.',
        title: 'Silver Wings, Santiago Blue',
      },
    ],
  };

  let insertedDailyWordId: string;

  afterAll(async () => {
    if (insertedDailyWordId) {
      // daily_word_definitions and daily_word_examples cascade-delete on the FK
      await db('daily_words').where({ id: insertedDailyWordId }).del();
    }

    await db.destroy();
    server?.close();
  });

  it('should insert a daily word with its definitions and examples', async () => {
    const result = await insertDailyWord(fixturePayload, displayDate);
    insertedDailyWordId = result.id;

    expect(result.word).toBe('chandelle');
    expect(result.wordnikId).toBe('test-wordnik-id-chandelle');
    expect(result.displayDate).toBe(displayDate);
    expect(result.providerName).toBe('wordnik');
    expect(result.providerId).toBe(711);

    expect(result.definitions).toHaveLength(2);
    expect(result.definitions[0]).toMatchObject({
      definition: 'A sudden, steep climbing turn of an aircraft.',
      partOfSpeech: 'noun',
      displayOrder: 0,
    });
    expect(result.definitions[1]).toMatchObject({
      definition: 'To execute a chandelle.',
      partOfSpeech: 'verb-intransitive',
      displayOrder: 1,
    });

    expect(result.examples).toHaveLength(2);
    expect(result.examples[0]).toMatchObject({
      exampleText:
        'Recovering on a reciprocal heading, the Spad pilot added power, climbing into a chandelle.',
      title: 'On Yankee Station',
      displayOrder: 0,
    });
  });

  it('should fetch the previously inserted word by display date', async () => {
    const result = await getDailyWordByDisplayDate(displayDate);

    expect(result).toBeDefined();
    expect(result?.word).toBe('chandelle');
    expect(result?.definitions).toHaveLength(2);
    expect(result?.examples).toHaveLength(2);
  });

  it('should return undefined when no word exists for the display date', async () => {
    const result = await getDailyWordByDisplayDate(noRowDisplayDate);

    expect(result).toBeUndefined();
  });

  it('should reject inserting a duplicate display date', async () => {
    await expect(
      insertDailyWord(fixturePayload, displayDate),
    ).rejects.toThrow();
  });
});
