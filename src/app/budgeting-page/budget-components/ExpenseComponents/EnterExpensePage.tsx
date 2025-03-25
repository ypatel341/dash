import React, { useEffect, useState } from 'react';
import { Button, Container, Box, Grid, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import ToastMessage from '../../../customizations/ToastMessages';
import en from '../../../i18n/en';
import {
  ExpensePerson,
  ExpenseType,
  ExpenseData,
  MonthlyExpense,
  ToastSeverityOptions,
  ToastMessageOptions,
} from '../../types/BudgetCategoryTypes';
import {
  formatMonthlyExpensesExpenseDate,
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
import ExpenseTable from './ExpenseTable';
import ExpenseMonthDateSelector from '../../shared-budget-components/ExpenseMonthDateSelector';

export const EnterExpensePage: React.FC = () => {
  // State Hooks
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
  const [data, setData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedYearMonth, setSelectedYearMonth] = useState<Date>(new Date());

  // Fetch expenses
  const fetchExpenses = async (controller?: AbortController) => {
    setLoading(true);

    try {
      const response = await axios.get(
        'http://localhost:5000/budget/info/allmonthexpense',
        { signal: controller?.signal },
      );

      const formattedData = await formatMonthlyExpensesExpenseDate(
        response.data,
      );
      setData(formattedData);
    } catch (error: unknown) {
      if (!axios.isCancel(error)) {
        setError(
          error instanceof Error ? error.message : en.errors.unknownError,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchExpenses(controller);

    return () => controller.abort();
  }, []);

  // Input Handlers
  const handleInputChange =
    (field: keyof ExpenseData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSelectChange =
    (field: keyof ExpenseData) => (event: SelectChangeEvent<string>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSetDate = (newDate: Dayjs | null) => {
    if (newDate) setDate(newDate);
  };

  // Expense Submission
  const handleSubmitButtonClick = async () => {
    const validationError = validateExpense(formData);
    if (validationError) {
      handleToastMessage({ message: validationError, severity: 'error' });
      return;
    }

    try {
      await postExpense();
      resetForm();
      await fetchExpenses();
    } catch {
      handleToastMessage({
        message: en.expense.errorMessage,
        severity: 'error',
      });
    }
  };

  const postExpense = async () => {
    const payload = { ...formData, date: date?.toISOString() };

    const response = await axios.post(
      'http://localhost:5000/budget/expense',
      payload,
    );
    setData((prev) => [...prev, response.data]);

    handleToastMessage({
      message: `${en.expense.successMessage} ${response.data.id}`,
      severity: 'success',
    });
  };

  const resetForm = () => {
    setFormData({
      person: 'Both' as ExpensePerson,
      bucketname: 'rent' as ExpenseType,
      vendor: '',
      amount: null,
      description: '',
    });
  };

  // Toast Message Handler
  const handleToastMessage = ({ message, severity }: ToastMessageOptions) => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowAlert(true);
  };

  const handleCloseAlert = () => setShowAlert(false);

  // Fetch Monthly Expenses by Date
  const getMonthlyExpenseData = async (selectedDate: Dayjs) => {
    const formattedDate = dayjs(selectedDate).format('YYYY-MM');
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/budget/info/getbymonthexpense/${formattedDate}`,
      );
      const formattedData = await formatMonthlyExpensesExpenseDate(
        response.data,
      );
      setData(formattedData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
            <Box display="flex" justifyContent="space-between">
              <DateField
                data-cy="date-field"
                date={date}
                onChange={handleSetDate}
              />
              <ExpenseMonthDateSelector
                label={en.common.datePicker}
                minDate={dayjs(en.common.budgetStartDate)}
                maxDate={dayjs(en.common.budgetEndDate)}
                value={dayjs(selectedYearMonth)}
                onChange={(newValue) =>
                  newValue && setSelectedYearMonth(newValue.toDate())
                }
                onAccept={(newValue) =>
                  newValue && getMonthlyExpenseData(newValue)
                }
              />
            </Box>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitButtonClick}
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
