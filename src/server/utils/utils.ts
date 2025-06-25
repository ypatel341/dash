import { getAllBudgetData } from './db-operation-helpers';
import logger from './logger';
import {
  InsertExpenseType,
  ExpenseRequestBody,
  BudgetType,
  MonthlyExpense,
  BucketExpenseMap,
  BudgetTypeWithCurrentAmount,
  AggregatedMonthlyReport,
  MonthlyExpenseWithTimestamps,
} from './types';

const VALIDATION_RULES = {
  AMOUNT: {
    MIN: 0,
    MAX: 10000,
  },
  REQUIRED_FIELDS: ['person', 'bucketname', 'vendor'] as const,
} as const;

export const validateExpense = async (
  reqBody: ExpenseRequestBody,
): Promise<InsertExpenseType> => {
  const { person, bucketname, vendor, amount, description, date } = reqBody;

  if (!amount || amount <= VALIDATION_RULES.AMOUNT.MIN || amount > VALIDATION_RULES.AMOUNT.MAX) {
    throw new Error(`Amount must be between $${VALIDATION_RULES.AMOUNT.MIN + 0.01} and $${VALIDATION_RULES.AMOUNT.MAX}`);
  }

  if (!person || !bucketname || !vendor) {
    throw new Error(
      `Missing required fields person: ${person}, bucketname: ${bucketname}, vendor: ${vendor}`,
    );
  }

  const expense: InsertExpenseType = {
    person,
    bucketname,
    vendor,
    amount,
    description,
  };

  if (date) {
    expense.expensedate = date;
  }

  return expense;
};

export const calculateBucketExpenses = async (
  rawMonthlyData: MonthlyExpense[],
  allBudgetData: BudgetType[],
): Promise<BudgetTypeWithCurrentAmount[]> => {
  const bucketExpenseMap: BucketExpenseMap = new Map();

  rawMonthlyData.forEach((expense) => {
    const currentAmount = bucketExpenseMap.get(expense.bucketname) || 0;
    bucketExpenseMap.set(expense.bucketname, currentAmount + expense.amount);
  });

  logger.info(`(fx: calculateBucketExpense): ${bucketExpenseMap}`);

  const budgetTypeWithCurrentAmount: BudgetTypeWithCurrentAmount[] =
    allBudgetData.map((budget) => {
      const currentamount = bucketExpenseMap.get(budget.bucketname) || 0;
      return {
        ...budget,
        currentamount,
      };
    });

  logger.info(`(fx: calculateBucketExpense): ${budgetTypeWithCurrentAmount}`);

  return budgetTypeWithCurrentAmount;
};

export const validateInputBucket = async (
  bucketname: string,
): Promise<boolean> => {
  const activeBucketNames = await getAllBudgetData();
  const bucketNames = activeBucketNames.map((bucket) => bucket.bucketname);
  return bucketNames.includes(bucketname);
};


/**
 * Gets the current year and month in YYYY-MM format.
 * @returns A promise that resolves to a string representing the current year and month
 * in the format "YYYY-MM" (e.g., "2024-03")
 */
export const getCurrentYearMonth = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
  return `${year}-${month}`;
};

/**
 * Checks if a given date string is valid and not in the YYYY-MM format.
 * @param dateString - The date string to validate
 * @returns True if the date string is valid and not in YYYY-MM format, false otherwise
 */
export const isValidDate = (dateString: string | undefined): boolean => {
  return !!dateString && !/^\d{4}-\d{2}$/.test(dateString as string);
};

/**
 * Converts monthly expenses to aggregated bucket expenses with budget allocations
 * @param monthlyExpenses - Array of monthly expenses with timestamps
 * @param monthlyBudgetAllocationResponse - Budget allocation data
 * @returns Promise resolving to aggregated monthly report
 */
export const formatMonthlyExpensesToBucketExpenses = async (
  monthlyExpenses: MonthlyExpenseWithTimestamps[],
  monthlyBudgetAllocationResponse: BudgetType[],
): Promise<AggregatedMonthlyReport> => {
  const formattedExpenses = formatExpenseDates(monthlyExpenses);
  const aggregatedReport = aggregateExpensesByBucket(formattedExpenses);
  const enrichedReport = enrichWithBudgetAllocations(
    aggregatedReport,
    monthlyBudgetAllocationResponse,
  );

  return enrichedReport;
};

/**
 * Formats the expense dates in an array of monthly expenses by converting them to ISO date strings.
 * @param monthlyExpenses - Array of monthly expense objects with timestamps
 * @returns Array of monthly expense objects with formatted date strings in YYYY-MM-DD format
 *
 */
export const formatExpenseDates = (
  monthlyExpenses: MonthlyExpenseWithTimestamps[],
): MonthlyExpenseWithTimestamps[] => {
  return monthlyExpenses.map((expense) => {
    const formattedExpense: MonthlyExpenseWithTimestamps = {
      ...expense,
      expensedate: new Date(expense.expensedate).toISOString().split('T')[0],
    };
    return formattedExpense;
  });
};

/**
 * Aggregates formatted expenses by bucket name
 * @param formattedExpenses - Array of expenses with formatted dates
 * @returns Aggregated report with expenses grouped by bucket
 */
export const aggregateExpensesByBucket = (
  formattedExpenses: MonthlyExpenseWithTimestamps[],
): AggregatedMonthlyReport => {
  const aggregatedMonthlyReport: AggregatedMonthlyReport = {
    buckets: {},
  };

  formattedExpenses.forEach((expense) => {
    const { bucketname, amount } = expense;

    if (!aggregatedMonthlyReport.buckets[bucketname]) {
      aggregatedMonthlyReport.buckets[bucketname] = {
        monthlyExpenseTotal: 0,
        monthlyBucketAllocation: 0, // Will be set later in enrichWithBudgetAllocations
        monthlyExpenses: [],
      };
    }

    aggregatedMonthlyReport.buckets[bucketname].monthlyExpenses.push(expense);
    aggregatedMonthlyReport.buckets[bucketname].monthlyExpenseTotal += amount;
  });

  const aggregatedMonthlyReportFormatted = roundToCurrency(
    aggregatedMonthlyReport,
  );

  return aggregatedMonthlyReportFormatted;
};

/**
 * Enriches aggregated report with budget allocation data
 * @param aggregatedReport - Report with aggregated expenses by bucket
 * @param monthlyBudgetAllocationResponse - Budget allocation data
 * @returns Enriched report with budget allocations
 */
export const enrichWithBudgetAllocations = (
  aggregatedReport: AggregatedMonthlyReport,
  monthlyBudgetAllocationResponse: BudgetType[],
): AggregatedMonthlyReport => {
  // Iterate through each bucket and find matching budget allocation
  Object.keys(aggregatedReport.buckets).forEach((bucketname) => {
    const budgetAllocation = monthlyBudgetAllocationResponse.find(
      ({ bucketname: allocationBucket }) => allocationBucket === bucketname,
    );

    if (budgetAllocation?.amount) {
      aggregatedReport.buckets[bucketname].monthlyBucketAllocation =
        budgetAllocation.amount;
    }
  });

  return aggregatedReport;
};

/**
 * Rounds the monthly expense totals and bucket allocations to two decimal places
 * @param report - Aggregated monthly report
 * @returns Report with rounded values
 */
export const roundToCurrency = (
  report: AggregatedMonthlyReport,
): AggregatedMonthlyReport => {
  Object.keys(report.buckets).forEach((bucketname) => {
    const bucket = report.buckets[bucketname];
    bucket.monthlyExpenseTotal = parseFloat(
      bucket.monthlyExpenseTotal.toFixed(2),
    );
    bucket.monthlyBucketAllocation = parseFloat(
      bucket.monthlyBucketAllocation.toFixed(2),
    );
  });
  return report;
};
