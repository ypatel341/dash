import { formattedDate } from '../budgeting-page/utils/helpers';

const en = {
  budgetHomePage: {
    header: 'Budget Home Page',
    resetMonth: 'Reset Month',
  },
  budgetSubHeader: {
    networth: 'Net Worth',
    moneyInMonth: 'Money-in Month',
    enterExpense: 'Enter Expense',
  },
  common: {
    enter: 'Enter',
    datePicker: 'Year and Month',
    budgetStartDate: '2025-01-01',
    budgetEndDate: formattedDate,
  },
  expense: {
    successMessage: 'The Expense was successfully saved',
    errorMessage: 'There was an error saving the Expense',
  },
  errors: {
    unknownError: 'An unknown error occurred',
  },
};

export default en;
