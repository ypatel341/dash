import { Router } from 'express';
import {
  deleteExpenseController,
  getAllBucketExpensesController,
  getAllMonthlyExpenses,
  getBucketExpensesController,
  getByMonthExpenseController,
  insertExpenseController,
  updateExpenseController,
} from '../controllers/budgetController';

const router = Router();

// GETS
router.get('/info/allmonthexpense', getAllMonthlyExpenses);
router.get('/info/allbucketexpense', getAllBucketExpensesController);
router.get('/info/bucketexpense/:bucketname', getBucketExpensesController);
router.get('/info/getbymonthexpense/:month', getByMonthExpenseController);

// POSTS
router.post('/expense', insertExpenseController);

// PATCHES
router.patch('/expense/:id', updateExpenseController);

// DELETES
router.delete('/expense/:id', deleteExpenseController);

export default router;
