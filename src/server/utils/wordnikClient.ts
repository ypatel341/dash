import axios from 'axios';
import logger from './logger';
import { WordnikWordOfTheDayResponse } from './types';

const WORDNIK_WORD_OF_THE_DAY_URL =
  'https://api.wordnik.com/v4/words.json/wordOfTheDay';

export const fetchWordOfTheDay =
  async (): Promise<WordnikWordOfTheDayResponse> => {
    const apiKey = process.env.WORDNIK_API_KEY;

    if (!apiKey) {
      throw new Error('Missing required environment variable: WORDNIK_API_KEY');
    }

    try {
      const response = await axios.get<WordnikWordOfTheDayResponse>(
        WORDNIK_WORD_OF_THE_DAY_URL,
        { params: { api_key: apiKey } },
      );

      return response.data;
    } catch (error) {
      logger.error(`Error fetching word of the day from Wordnik: ${error}`);
      throw error;
    }
  };
