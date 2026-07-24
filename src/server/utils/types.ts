// Request Body -> using interfaces
// TODO: sort all of the types by usages
export interface ExpenseRequestBody {
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  expensable?: boolean;
  reimbursement?: ReimbursableExpense;
  description?: string;
  date?: string;
}

export type BudgetType = {
  id: string;
  category: string;
  bucketname: string;
  amount: number;
  household: string;
};

export type BudgetTypeWithCurrentAmount = BudgetType & {
  currentamount: number;
};

export type InsertExpenseType = {
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  expensable?: boolean;
  description?: string;
  expensedate?: string;
  reimbursement?: ReimbursableExpense;
};

export type ReimbursableExpense = {
  company: string;
  description: string;
};

export type UpdateExpenseType = {
  id: string;
  updatedat: string;
  person?: string;
  bucketname?: string;
  vendor?: string;
  amount?: number;
  description?: string;
  expensedate?: string;
};

export type MonthlyExpense = {
  id: string;
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description: string;
  expensedate: string;
};

export type MonthlyExpenseWithReimbursable = MonthlyExpense & {
  expensable: boolean;
  reimbursement?: ReimbursableExpense;
};

export type MonthlyExpenseWithTimestamps = MonthlyExpense & {
  createdat: string;
  updatedat: string | null;
  deletedat: string | null;
};

export type MonthlyExpensesWithBucketSummary = {
  monthlyExpenseTotal: number;
  monthlyBucketAllocation: number;
  monthlyExpenses: MonthlyExpenseWithTimestamps[];
};

export type AggregatedMonthlyReport = {
  buckets: {
    [bucketName: string]: MonthlyExpensesWithBucketSummary;
  };
};

export type AggregatedMonthlyReportWithYearlyData = AggregatedMonthlyReport & {
  yearlyAccumulatedData?: CurrentYearlyAccumulatedData[];
};

export type InsertResponseId = {
  id: string;
};

export type BudgetSummaryResponse = {
  message: string;
};

export type BucketExpenseMap = Map<string, number>;

export type RenderPDFDataInput = {
  reportDate: string;
  templateData: AggregatedMonthlyReport;
  templateStyleSheet: string;
  reportName: string;
};

export type GeneratePDFInput = {
  htmlString: string;
  reportDate: string;
  reportName: string;
};

export type CurrentYearlyAccumulatedData = {
  bucketname: string;
  yearlyAccumulated: number;
};

export type CurrentYearlyAccumulatedWithAllocation =
  CurrentYearlyAccumulatedData & {
    yearlyAllocated: number;
  };

export type GenerateReportInput = {
  aggregateMonthlyData: AggregatedMonthlyReport;
  aggregateYearlyData: CurrentYearlyAccumulatedData[];
  YYYYMM: string;
};

// Wordnik "word of the day" API response shape
export type WordnikDefinition = {
  text: string;
  partOfSpeech: string | null;
  source: string | null;
  note: string | null;
};

export type WordnikExample = {
  id?: number;
  url: string | null;
  text: string;
  title: string | null;
};

export type WordnikWordOfTheDayResponse = {
  _id: string;
  word: string;
  publishDate: string;
  contentProvider: {
    name: string;
    id: number;
  };
  note: string | null;
  htmlExtra: string | null;
  pdd: string;
  definitions: WordnikDefinition[];
  examples: WordnikExample[];
};

export type DailyWordDefinition = {
  definition: string;
  partOfSpeech: string | null;
  source: string | null;
  note: string | null;
  displayOrder: number;
};

export type DailyWordExample = {
  exampleText: string;
  title: string | null;
  sourceUrl: string | null;
  displayOrder: number;
};

export type DailyWord = {
  id: string;
  wordnikId: string;
  word: string;
  displayDate: string;
  publishDate: string;
  providerName: string;
  providerId: number | null;
  note: string | null;
  htmlExtra: string | null;
  definitions: DailyWordDefinition[];
  examples: DailyWordExample[];
};
