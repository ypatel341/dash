import { Request, Response } from 'express';
import { getWordOfTheDayService } from '../services/dailyWordService';
import logger from '../utils/logger';

export const getWordOfTheDayController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const data = await getWordOfTheDayService();
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching word of the day: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
