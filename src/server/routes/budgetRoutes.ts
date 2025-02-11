import { Router } from 'express';
import {
  deleteExpenseController,
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

router.delete('/expense/:id', deleteExpenseController);

export default router;
