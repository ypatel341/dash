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
};

export type SubHeaderTitles = 'Net Worth' | 'Money-in Month' | 'Enter Expense';

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

export const expensePersonOptions: ExpensePerson[] = ['Yogi', 'Riddhi', 'Both'];

export type MonthlyExpense = {
  id: string;
  person: string;
  bucketname: string;
  vendor: string;
  amount: number;
  description: string;
  expensedate: string;
};
