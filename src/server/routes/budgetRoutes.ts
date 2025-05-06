import { Router } from 'express';
import {
  deleteExpenseController,
  getAllBucketExpensesController,
  getAllMonthlyExpenses,
  getBucketExpensesController,
  getByMonthExpenseController,
  insertExpenseController,
  updateExpenseController,
  healthCheckController,
  healthCheckDbController,
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

// Health Checks
router.get('/health', healthCheckController);
router.get('/healthCheckDb', healthCheckDbController);

export default router;
