import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Container } from '@mui/material';

import { BudgetData } from './types/BudgetCategoryTypes';
import BudgetCategoryComponent from './budgetComponents/BudgetCategoryComponent';
import BudgetSubHeader from './budgetComponents/BudgetSubHeader';

const BudgetHomePage: React.FC = () => {
  const [data, setData] = useState<BudgetData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/budget/info/all')
      .then((response) => {
        setData(response.data);
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

  if (!data) {
    return <div>Error: Data not found</div>;
  }

  return (
    <Container>
      <h1>Budget Home Page</h1>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader title={"Net Worth"} />{' '}
          {/* TODO: consider making these an enum */}
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader title="Money-in Month" />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BudgetSubHeader title="Enter Expense" />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <BudgetCategoryComponent data={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BudgetHomePage;
