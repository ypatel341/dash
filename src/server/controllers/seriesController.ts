import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  validateCreateSeries,
  validateUpdateSeries,
  listSeriesService,
  getSeriesByIdService,
  createSeriesService,
  updateSeriesService,
  pauseSeriesService,
  resumeSeriesService,
  archiveSeriesService,
} from '../services/seriesService';

export const listSeriesController = async (_req: Request, res: Response) => {
  try {
    const series = await listSeriesService();
    res.json(series);
  } catch (error) {
    logger.error(`Error fetching series: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const getSeriesController = async (req: Request, res: Response) => {
  try {
    const series = await getSeriesByIdService(req.params.id);
    if (!series) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }
    res.json(series);
  } catch (error) {
    logger.error(`Error fetching series: ${error}`);
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const createSeriesController = async (req: Request, res: Response) => {
  try {
    const validated = validateCreateSeries(req.body);
    const result = await createSeriesService(validated);
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Error creating series: ${error}`);
    res.status(400).json({ error: `Failed to create series: ${error}` });
  }
};

export const updateSeriesController = async (req: Request, res: Response) => {
  try {
    const validated = validateUpdateSeries(req.body);
    const series = await updateSeriesService(req.params.id, validated);
    res.json(series);
  } catch (error) {
    logger.error(`Error updating series: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    res.status(400).json({ error: `Failed to update series: ${error}` });
  }
};

export const pauseSeriesController = async (req: Request, res: Response) => {
  try {
    const series = await pauseSeriesService(req.params.id);
    res.json(series);
  } catch (error) {
    logger.error(`Error pausing series: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes('Cannot transition')) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const resumeSeriesController = async (req: Request, res: Response) => {
  try {
    const result = await resumeSeriesService(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error(`Error resuming series: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes('Cannot transition')) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

export const archiveSeriesController = async (req: Request, res: Response) => {
  try {
    const series = await archiveSeriesService(req.params.id);
    res.json(series);
  } catch (error) {
    logger.error(`Error archiving series: ${error}`);
    const msg = (error as Error).message || '';
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes('Cannot transition')) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
