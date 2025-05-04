import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Container, Button } from '@mui/material';
import { BudgetData } from './types/BudgetCategoryTypes';
import BudgetCategoryComponent from './budget-components/BudgetCategoryComponent';
import BudgetSubHeader from './budget-components/BudgetSubHeader';
import dayjs, { Dayjs } from 'dayjs';
import {
  calculateSurplus,
  formatMonthlyExpensesToBucketExpenses,
} from './utils/helpers';
import ExpenseMonthDateSelector from './shared-budget-components/ExpenseMonthDateSelector';
import en from '../i18n/en';

const BudgetHomePage: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlyTotalAmount, setMonthlyAmount] = useState<number>(0);
  const [currentMonthlyUsage, setMonthlyUsage] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/budget/info/allbucketexpense',
      );

      const { data } = response;
      const { monthlyTotalBudget, currentMonthlyUsage } =
        await calculateSurplus(data);

      setMonthlyAmount(monthlyTotalBudget);
      setMonthlyUsage(currentMonthlyUsage);
      setBudgetData(data);
    } catch (error: unknown) {
      error instanceof Error
        ? setError(error.message)
        : setError(en.errors.unknownError);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: with retrieving data{error}</div>;
  }

  if (!budgetData) {
    return <div>Error: Data not found</div>;
  }

  const getFormattedMonthlyExpenseData = async (
    date: Dayjs,
    existingBudgetData: BudgetData[],
  ) => {
    const formattedDate = dayjs(date).format('YYYY-MM');
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/budget/info/getbymonthexpense/${formattedDate}`,
      );
      const { data } = response;

      const formattedData: BudgetData[] =
        await formatMonthlyExpensesToBucketExpenses(data, existingBudgetData);

      const { monthlyTotalBudget, currentMonthlyUsage } =
        await calculateSurplus(data);

      setMonthlyUsage(currentMonthlyUsage);
      setMonthlyAmount(monthlyTotalBudget);
      setBudgetData(formattedData);
    } catch (error: unknown) {
      error instanceof Error
        ? setError(error.message)
        : setError(en.errors.unknownError);
    } finally {
      setLoading(false);
    }
  };

  const resetData = async () => {
    fetchData();
    setSelectedDate(new Date());
  };

  return (
    <Container>
      <h1>{en.budgetHomePage.header}</h1>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader
            title={'Monthly Budget'}
            subValue={monthlyTotalAmount}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader
            title="Monthly Usage"
            subValue={currentMonthlyUsage}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader title="Enter Expense" />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}></Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ExpenseMonthDateSelector
            label={en.common.datePicker}
            minDate={dayjs(en.common.budgetStartDate)}
            maxDate={dayjs(en.common.budgetEndDate)}
            value={dayjs(selectedDate)}
            onChange={(dateValue) => {
              dateValue && setSelectedDate(dateValue.toDate());
            }}
            onAccept={(dateValue) => {
              dateValue &&
                getFormattedMonthlyExpenseData(dateValue, budgetData);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => resetData()}
          >
            {en.budgetHomePage.resetMonth}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {budgetData.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <BudgetCategoryComponent data={item} month={selectedDate} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BudgetHomePage;
