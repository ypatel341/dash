import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Container, Button } from '@mui/material';
import { BudgetData } from './types/BudgetCategoryTypes';
import BudgetCategoryComponent from './budget-components/BudgetCategoryComponent';
import BudgetSubHeader from './budget-components/BudgetSubHeader';
import dayjs, { Dayjs } from 'dayjs';
import { formatMonthlyExpensesToBucketExpenses } from './utils/helpers';
import ExpenseMonthDateSelector from './shared-budget-components/ExpenseMonthDateSelector';
import en from '../i18n/en';

const BudgetHomePage: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

      setBudgetData(data);
    } catch (error: any) {
      setError(error.message);
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

      setBudgetData(formattedData);
    } catch (error: any) {
      setError(error.message);
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
          <BudgetSubHeader title={'Net Worth'} />{' '}
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader title="Money-in Month" />
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
            onChange={(newValue) => {
              newValue && setSelectedDate(newValue.toDate());
            }}
            onAccept={(newValue) => {
              newValue && getFormattedMonthlyExpenseData(newValue, budgetData);
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
            <BudgetCategoryComponent data={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BudgetHomePage;
