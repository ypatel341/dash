export type BudgetData = {
  id: string;
  category: string;
  bucketname: string;
  amount: number;
  household: string;
};

export type BudgetComponentProps = {
  data: BudgetData;
};

export type SubHeaderTitles = 'Net Worth' | 'Money-in Month' | 'Enter Expense';

export const SubHeaderRoutes: { [key in SubHeaderTitles]: string } = {
  'Net Worth': '/net-worth',
  'Money-in Month': '/money-in-month',
  'Enter Expense': '/enter-expense',
};
