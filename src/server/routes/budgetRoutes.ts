import { Router } from 'express';
import {
  getAllBucketExpensesController,
  getAllMonthlyExpenses,
  getBucketExpensesController,
  insertExpenseController,
} from '../controllers/budgetController';

const router = Router();

// GETS
router.get('/info/allmonthexpense', getAllMonthlyExpenses);
router.get('/info/allbucketexpense', getAllBucketExpensesController);
router.get('/info/bucketexpense/:bucketname', getBucketExpensesController);

// POSTS
router.post('/expense', insertExpenseController);

export default router;
