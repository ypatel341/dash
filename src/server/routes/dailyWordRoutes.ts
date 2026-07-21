import { Router } from 'express';
import { getWordOfTheDayController } from '../controllers/dailyWordController';

const router = Router();

// GETS
router.get('/', getWordOfTheDayController);

export default router;
