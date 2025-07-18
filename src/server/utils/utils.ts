import { VALIDATION_RULES } from './consts';
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
  ReimbursableExpense,
} from './types';

/**
 * Validates an expense request body and returns a properly formatted expense object.
 * @param reqBody - The expense request body containing expense details
 * @param reqBody.person - The person associated with the expense
 * @param reqBody.bucketname - The bucket/category name for the expense
 * @param reqBody.vendor - The vendor/merchant name
 * @param reqBody.amount - The expense amount (must be within validation limits)
 * @param reqBody.description - Optional description of the expense
 * @param reqBody.date - Optional date of the expense
 *
 * @returns A promise that resolves to a validated InsertExpenseType object
 *
 * @throws {Error} When amount is outside the valid range (min/max validation rules)
 * @throws {Error} When required fields (person, bucketname, vendor) are missing
 */
export const validateExpense = async (
  reqBody: ExpenseRequestBody,
): Promise<InsertExpenseType> => {
  const {
    person,
    bucketname,
    vendor,
    amount,
    description,
    date,
    expensable,
    reimbursement,
  } = reqBody;

  if (
    !amount ||
    amount <= VALIDATION_RULES.AMOUNT.MIN ||
    amount > VALIDATION_RULES.AMOUNT.MAX
  ) {
    throw new Error(
      `Amount must be between $${VALIDATION_RULES.AMOUNT.MIN + 0.01} and $${VALIDATION_RULES.AMOUNT.MAX}`,
    );
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
    expensable,
    reimbursement,
  };

  if (date) {
    expense.expensedate = date;
  }

  return expense;
};

/**
 * Calculates bucket expenses by mapping raw monthly data to budget types with current amounts.
 * @param rawMonthlyData - Array of monthly expense data to be processed
 * @param allBudgetData - Array of budget type configurations
 * @returns Promise that resolves to an array of budget types enriched with current expense amounts
 */
export const calculateBucketExpenses = async (
  rawMonthlyData: MonthlyExpense[],
  allBudgetData: BudgetType[],
): Promise<BudgetTypeWithCurrentAmount[]> => {
  const bucketExpenseMap: BucketExpenseMap =
    mapRawMonthlyDataToBucketExpense(rawMonthlyData);

  logger.info(`(fx: calculateBucketExpense): ${bucketExpenseMap}`);

  const budgetTypeWithCurrentAmount = appendCurrentAmountToBudgetData(
    allBudgetData,
    bucketExpenseMap,
  );

  logger.info(`(fx: calculateBucketExpense): ${budgetTypeWithCurrentAmount}`);

  return budgetTypeWithCurrentAmount;
};

/**
 * Appends current expense amounts to budget data by looking up expenses for each budget's bucket.
 * @param allBudgetData - Array of budget objects to enhance with current amounts
 * @param bucketExpenseMap - Map containing bucket names as keys and their corresponding expense amounts as values
 * @returns Array of budget objects enhanced with current expense amounts for each bucket
 */
const appendCurrentAmountToBudgetData = (
  allBudgetData: BudgetType[],
  bucketExpenseMap: BucketExpenseMap,
): BudgetTypeWithCurrentAmount[] => {
  return allBudgetData.map((budget) => {
    const currentamount = bucketExpenseMap.get(budget.bucketname) || 0;
    return {
      ...budget,
      currentamount,
    };
  });
};

/**
 * Maps an array of monthly expense data to a bucket expense map by aggregating amounts per bucket.
 * @param rawMonthlyData - Array of monthly expense objects containing bucket names and amounts
 * @returns A Map where keys are bucket names and values are the total aggregated amounts for each bucket
 */
const mapRawMonthlyDataToBucketExpense = (
  rawMonthlyData: MonthlyExpense[],
): BucketExpenseMap => {
  const bucketExpenseMap: BucketExpenseMap = new Map();

  rawMonthlyData.forEach((expense) => {
    const currentAmount = bucketExpenseMap.get(expense.bucketname) || 0;
    bucketExpenseMap.set(expense.bucketname, currentAmount + expense.amount);
  });

  return bucketExpenseMap;
};

/**
 * Validates if a given bucket name exists in the active budget data.
 * @param bucketname - The name of the bucket to validate
 * @returns A promise that resolves to true if the bucket name exists in the active budget data, false otherwise
 */
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

export const validateReimbursableExpense = async (
  reimbursement: ReimbursableExpense | undefined,
): Promise<ReimbursableExpense> => {
  if (!reimbursement) {
    logger.info(
      'No reimbursement provided, update company and description to empty strings',
    );
    return {
      company: '',
      description: '',
    };
  }
  const { company, description } = reimbursement;

  if (!company) {
    logger.info('Update company name to empty string');
    reimbursement.company = '';
    reimbursement.description = 'Update company name to empty string';
  }

  if (!description) {
    logger.info('No description provided, setting to empty string');
    reimbursement.description = '';
  }

  return reimbursement;
};
