import {
  BudgetType,
  BudgetTypeWithCurrentAmount,
  MonthlyExpense,
} from '../utils/types';

export const rawMonthlyData: MonthlyExpense[] = [
  {
    bucketname: 'rent',
    amount: 1000,
    description: 'rent',
    expensedate: '2021-01-01',
    id: '1',
    person: 'person',
    vendor: 'vendor',
  },
  {
    bucketname: 'groceries',
    amount: 200,
    description: 'groceries',
    expensedate: '2021-01-01',
    id: '2',
    person: 'person',
    vendor: 'vendor',
  },
  {
    bucketname: 'rent',
    amount: 500,
    description: 'rent',
    expensedate: '2021-01-01',
    id: '3',
    person: 'person',
    vendor: 'vendor',
  },
  {
    bucketname: 'entertainment',
    amount: 150,
    description: 'entertainment',
    expensedate: '2021-01-01',
    id: '4',
    person: 'person',
    vendor: 'vendor',
  },
];

export const allBudgetData: BudgetType[] = [
  {
    bucketname: 'rent',
    amount: 2000,
    category: 'housing',
    household: 'household',
    id: '1',
  },
  {
    bucketname: 'groceries',
    amount: 300,
    category: 'food',
    household: 'household',
    id: '2',
  },
  {
    bucketname: 'entertainment',
    amount: 200,
    category: 'fun',
    household: 'household',
    id: '3',
  },
];

export const expectedCaclulatedBudgetExpenses: BudgetTypeWithCurrentAmount[] = [
  {
    bucketname: 'rent',
    amount: 2000,
    currentamount: 1500,
    category: 'housing',
    household: 'household',
    id: '1',
  },
  {
    bucketname: 'groceries',
    amount: 300,
    currentamount: 200,
    category: 'food',
    household: 'household',
    id: '2',
  },
  {
    bucketname: 'entertainment',
    amount: 200,
    currentamount: 150,
    category: 'fun',
    household: 'household',
    id: '3',
  },
];

// test 2 data
export const rawMonthlyDataTest2: MonthlyExpense[] = [
  {
    bucketname: 'rent',
    amount: 1000,
    description: 'rent',
    expensedate: '2021-01-01',
    id: '1',
    person: 'person',
    vendor: 'vendor',
  },
];

export const allBudgetDataTest2: BudgetType[] = [
  {
    bucketname: 'rent',
    amount: 2000,
    category: 'housing',
    household: 'household',
    id: '1',
  },
  {
    bucketname: 'groceries',
    amount: 300,
    category: 'food',
    household: 'household',
    id: '2',
  },
];

export const expectedTest2: BudgetTypeWithCurrentAmount[] = [
  {
    bucketname: 'rent',
    amount: 2000,
    currentamount: 1000,
    category: 'housing',
    household: 'household',
    id: '1',
  },
  {
    bucketname: 'groceries',
    amount: 300,
    currentamount: 0,
    category: 'food',
    household: 'household',
    id: '2',
  },
];
