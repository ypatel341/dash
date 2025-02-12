import React, { useEffect, useState } from 'react';
import { Button, Container, Box, SelectChangeEvent, Grid } from '@mui/material';
import {
  ExpensePerson,
  ExpenseType,
  ExpenseData,
  MonthlyExpense,
  ToastSeverityOptions,
  ToastMessageOptions,
} from '../../types/BudgetCategoryTypes';
import axios from 'axios';
import ToastMessage from '../../../customizations/ToastMessages';
import dayjs, { Dayjs } from 'dayjs';
import {
  formatTimestamptzToMMDDYYYY,
  validateExpense,
} from '../../utils/helpers';
import {
  AmountField,
  DateField,
  DescriptionField,
  PersonField,
  TypeField,
  VendorField,
} from './ExpenseSubComponents';
import en from '../../../i18n/en';
import ExpenseTable from './ExpenseTable';

export const EnterExpensePage: React.FC = () => {
  // Setting states
  const [formData, setFormData] = useState<ExpenseData>({
    person: 'Both' as ExpensePerson,
    bucketname: 'rent' as ExpenseType,
    vendor: '',
    amount: null,
    description: '',
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSeverity, setToastSeverity] =
    useState<ToastSeverityOptions>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [date, setDate] = useState<Dayjs>(dayjs(new Date()));
  const [data, setData] = useState<MonthlyExpense[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetching data
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/budget/info/allmonthexpense',
      );

      const formattedData = response.data.map((expense: MonthlyExpense) => ({
        ...expense,
        expensedate: formatTimestamptzToMMDDYYYY(expense.expensedate),
      }));

      setData(formattedData);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleInputChange =
    (field: keyof ExpenseData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSelectChange =
    (field: keyof ExpenseData) => (event: SelectChangeEvent<any>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSetDate = (newDate: Dayjs | null) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleButtonClick = async () => {
    const validationError = validateExpense(formData);
    if (validationError) {
      const toastMessageInfo: ToastMessageOptions = {
        message: validationError,
        severity: 'error',
      };

      handleToastMessage(toastMessageInfo);
      return;
    }

    try {
      await postExpense();
      fetchExpenses();
    } catch (error) {
      const toastMessageInfo: ToastMessageOptions = {
        message: en.expense.errorMessage,
        severity: 'error',
      };
      handleToastMessage(toastMessageInfo);
    }
  };

  const postExpense = async () => {
    const data = { ...formData };

    if (date) {
      data.date = date.toISOString();
    }

    await axios.post('http://localhost:5000/budget/expense', data);
    const toastMessageSeverity: ToastMessageOptions = {
      message: en.expense.successMessage,
      severity: 'success',
    };

    handleToastMessage(toastMessageSeverity);
  };

  const handleToastMessage = (toastMessageSeverity: ToastMessageOptions) => {
    const { message, severity } = toastMessageSeverity;

    setToastMessage(message);
    setToastSeverity(severity);
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <PersonField
              person={formData.person}
              onChange={handleSelectChange('person')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AmountField
              amount={formData.amount?.toString() || ''}
              onChange={handleInputChange('amount')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VendorField
              vendor={formData.vendor}
              onChange={handleInputChange('vendor')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TypeField
              type={formData.bucketname}
              onChange={handleSelectChange('bucketname')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DescriptionField
              description={formData.description}
              onChange={handleInputChange('description')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateField
              data-cy="date-field"
              date={date}
              onChange={handleSetDate}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={
            !formData.amount || !formData.bucketname || !formData.vendor
          }
          id="submit-button"
        >
          {en.common.enter}
        </Button>
        {showAlert && (
          <ToastMessage
            message={toastMessage}
            severity={toastSeverity}
            onClose={handleCloseAlert}
          />
        )}
        {!loading && !error && (
          <ExpenseTable
            data={data}
            handleToastMessage={handleToastMessage}
            refetchData={fetchExpenses}
          />
        )}
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
      </Box>
    </Container>
  );
};
