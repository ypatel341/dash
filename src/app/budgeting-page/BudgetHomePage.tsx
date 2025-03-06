import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Container } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BudgetData } from './types/BudgetCategoryTypes';
import BudgetCategoryComponent from './budget-components/BudgetCategoryComponent';
import BudgetSubHeader from './budget-components/BudgetSubHeader';
import dayjs, { Dayjs } from 'dayjs';
import { formatMonthlyExpensesToBucketExpenses } from './utils/helpers';

const BudgetHomePage: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    axios
      .get('http://localhost:5000/budget/info/allbucketexpense')
      .then((response) => {
        const { data } = response;

        setBudgetData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: with retrieving data{error}</div>;
  }

  if (!budgetData) {
    return <div>Error: Data not found</div>;
  }

  const queryNewData = async (date: Dayjs, existingBudgetData: BudgetData[]) => {
    const formattedDate = dayjs(date).format('YYYY-MM');
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/budget/info/getbymonthexpense/${formattedDate}`);
      const { data } = response;

      const formattedData: BudgetData[] = await formatMonthlyExpensesToBucketExpenses(data, existingBudgetData);

      setBudgetData(formattedData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>Budget Home Page</h1>
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
      <Grid>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            views={['year', 'month']}
            label="Year and Month"
            minDate={dayjs('2024-01-01')}
            maxDate={dayjs('2025-04-01')}
            value={dayjs(selectedDate)}
            onChange={(newValue) => {
              newValue && setSelectedDate(newValue.toDate());
            }}
            onAccept={(newValue) => {
              newValue && queryNewData(newValue, budgetData);
            }}
          />
        </LocalizationProvider>
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
