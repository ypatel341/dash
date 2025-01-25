// Types
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

// Update these types to match the data you are working with from the API, the data will be in the BudgetCategoryComponents.tsx file
export type ExpenseType = 
'rent' | 
'electric' | 
'internet' | 
'parcel' | 
'groceries' |
'gas' | 
'therapy' |
'house_supplies' |
'netflix' |
'spotify' |
'date_night' |
'vacation' |
'going_out_yogi' |
'gifts' |
'yogi_activities' |
'clothes' |
'savings_chase_2112';

export type ExpensePerson = 'Yogi' | 'Riddhi' | 'Both';

// Constants
export const SubHeaderRoutes: { [key in SubHeaderTitles]: string } = {
  'Net Worth': '/net-worth',
  'Money-in Month': '/money-in-month',
  'Enter Expense': '/enter-expense',
};

export const expenseTypeOptions: ExpenseType[] = ['rent', 'electric', 'internet', 'parcel', 'groceries','gas', 'therapy', 'house_supplies', 'netflix', 'spotify', 'date_night', 'vacation', 'going_out_yogi', 'gifts', 'yogi_activities', 'clothes', 'savings_chase_2112'];

export const expensePersonOptions: ExpensePerson[] = ['Yogi', 'Riddhi', 'Both'];