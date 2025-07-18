import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Box,
  SelectChangeEvent,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
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
import en from '../../../i18n/en';
import ExpenseTable from './ExpenseTable';
import ExpenseMonthDateSelector from '../../shared-budget-components/ExpenseMonthDateSelector';

export const EnterExpensePage: React.FC = () => {
  // Setting states
  const [formData, setFormData] = useState<ExpenseData>({
    person: 'Both' as ExpensePerson,
    bucketname: 'rent' as ExpenseType,
    vendor: '',
    amount: null,
    description: '',
    expensable: false,
    reimbursement:{
      company: '',
      description: '',
      field3: '',
    }
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSeverity, setToastSeverity] =
    useState<ToastSeverityOptions>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [date, setDate] = useState<Dayjs>(dayjs(new Date()));
  const [data, setData] = useState<MonthlyExpense[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedYearMonth, setSelectedYearMonth] = useState<Date>(new Date());

  // Fetching data
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/budget/info/allmonthexpense`,
      );

      const { data } = response;
      const formattedData = await formatMonthlyExpensesExpenseDate(data);

      setData(formattedData);
      setLoading(false);
    } catch (error: unknown) {
      error instanceof Error
        ? setError(error.message)
        : setError(en.errors.unknownError);
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

  const handleReimbursementInputChange = 
    (field: keyof NonNullable<ExpenseData['reimbursement']>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        reimbursement: {
          company: prev.reimbursement?.company || '',
          description: prev.reimbursement?.description || '',
          field3: prev.reimbursement?.field3 || '',
          [field]: event.target.value,
        },
      }));
    };

  const handleSelectChange =
    (field: keyof ExpenseData) => (event: SelectChangeEvent<string>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSetDate = (newDate: Dayjs | null) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleExpensableButtonClick = async () => {
    setFormData((prev) => ({
      ...prev,
      expensable: !prev.expensable,
    }));
    console.log('formData after toggle:', formData);
  };

  const handleSubmitButtonClick = async () => {
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
      // set state back to initial
      setFormData({
        person: 'Both' as ExpensePerson,
        bucketname: 'rent' as ExpenseType,
        vendor: '',
        amount: null,
        description: '',
        expensable: false,
        reimbursement:{
          company: '',
          description: '',
          field3: '',
        }
      });
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

    console.log(data)

    if (date) {
      data.date = date.toISOString();
    }

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/budget/expense`,
      data,
    );
    const toastMessageSeverity: ToastMessageOptions = {
      message: `en.expense.successMessage ${response.data.id}`,
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

  const getMonthlyExpenseData = async (date: Dayjs) => {
    const formattedDate = dayjs(date).format('YYYY-MM');
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/budget/info/getbymonthexpense/${formattedDate}`,
      );
      const { data } = response;
      const formattedData = await formatMonthlyExpensesExpenseDate(data);

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
                onChange={(newValue) => {
                  newValue && setSelectedYearMonth(newValue.toDate());
                }}
                onAccept={(newValue) => {
                  newValue && getMonthlyExpenseData(newValue);
                }}
              />
            </Box>
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.expensable}
              onChange={handleExpensableButtonClick}
            />
          }
          label="Expensable"
        />
        {formData.expensable && (
          <>
            <TextField
              label="Company"
              value={formData.reimbursement?.company}
              onChange={handleReimbursementInputChange('company')}
            />
            <TextField
              label="Description"
              value={formData.reimbursement?.description}
              onChange={handleReimbursementInputChange('description')}
            />
            <TextField
              label="Field 3"
              value={formData.reimbursement?.field3}
              onChange={handleReimbursementInputChange('field3')}
            />
          </>
        )}
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
