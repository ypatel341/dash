// Types
export type BudgetData = {
  id: string;
  category: string;
  bucketname: string;
  amount: number;
  household: string;
  currentamount: number;
};

export type BudgetComponentProps = {
  data: BudgetData;
  month: Date;
};

export type SubHeaderTitles =
  | 'Net Worth'
  | 'Money-in Month'
  | 'Enter Expense'
  | 'Monthly Budget'
  | 'Monthly Usage';

// Update these types to match the data you are working with from the API, the data will be in the BudgetCategoryComponents.tsx file
export type ExpenseType =
  | 'rent'
  | 'electric'
  | 'internet'
  | 'parcel'
  | 'groceries'
  | 'gas'
  | 'therapy'
  | 'house_supplies'
  | 'netflix'
  | 'spotify'
  | 'date_night'
  | 'vacation'
  | 'going_out_yogi'
  | 'gifts'
  | 'yogi_activities'
  | 'clothes'
  | 'savings_chase_2112';

export type ExpensePerson = 'Yogi' | 'Riddhi' | 'Both';

export type ExpenseData = {
  person: ExpensePerson;
  bucketname: ExpenseType;
  vendor: string;
  amount: number | null;
  expensable: boolean;
  reimbursement?: {
    company: string;
    description: string;
  };
  description?: string;
  date?: string;
};

export type ToastSeverityOptions = 'success' | 'error' | 'info' | 'warning';
export type ToastMessageOptions = {
  message: string;
  severity: ToastSeverityOptions;
};

// Constants
export const SubHeaderRoutes: { [key in SubHeaderTitles]: string } = {
  'Net Worth': '/budget/net-worth',
  'Money-in Month': '/budget/money-in-month',
  'Enter Expense': '/budget/enter-expense',
  'Monthly Budget': '/budget/monthly-budget',
  'Monthly Usage': '/budget/monthly-usage',
};

export const expenseTypeOptions: ExpenseType[] = [
  'rent',
  'electric',
  'internet',
  'parcel',
  'groceries',
  'gas',
  'therapy',
  'house_supplies',
  'netflix',
  'spotify',
  'date_night',
  'vacation',
  'going_out_yogi',
  'gifts',
  'yogi_activities',
  'clothes',
  'savings_chase_2112',
];

export const expenseTypeOptionsMapping = {
  rent: 'Rent',
  electric: 'Electric',
  internet: 'Internet',
  parcel: 'Parcel',
  groceries: 'Groceries',
  gas: 'Gas',
  therapy: 'Therapy',
  house_supplies: 'House Supplies',
  netflix: 'Netflix',
  spotify: 'Spotify',
  date_night: 'Date Night',
  vacation: 'Vacation',
  going_out_yogi: 'Going Out Yogi',
  gifts: 'Gifts',
  yogi_activities: 'Yogi Activities',
  clothes: 'Clothes',
  savings_chase_2112: 'Savings Chase 2112',
};

export const expensePersonOptions: ExpensePerson[] = ['Yogi', 'Riddhi', 'Both'];

export type MonthlyExpense = {
  id: string;
  person: string;
  bucketname: string; //
  vendor: string;
  amount: number; //
  description: string;
  expensedate: string;
};

export type MonthlyExpenseWithReimbursement = MonthlyExpense & {
  reimbursement?: {
    company: string;
    description: string;
  };
};

export type CurrentTotalAmount = {
  monthlyTotalBudget: number;
  currentMonthlyUsage: number;
  monthlySurplus: number;
};
