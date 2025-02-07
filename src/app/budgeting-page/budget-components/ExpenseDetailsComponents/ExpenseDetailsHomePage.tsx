import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import ExpenseTable from '../ExpenseComponents/ExpenseTable';
import { MonthlyExpense, BudgetData } from '../../types/BudgetCategoryTypes';

/**
 * NOTES FOR SELF:
 * useLocation is used to access state, location, and history from the current route.
 * useParam is used to access the parameters from the current route (from the URL).
 * both are useful, ~but in ourcase since we have all of the data currently in state, lets go with useLocation~
 * We will use both, this is for navigating to the page directly as opposed clicking in
 */

const BudgetHomePage: React.FC = () => {
  const locationData = useLocation();
  const data = locationData.state?.data as BudgetData;
  console.log(data);
  const { bucketname } = useParams<{ bucketname: string }>();

  const [bucketData, setBucketData] = React.useState<MonthlyExpense[]>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');

  const fetchBucketData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/budget/info/bucketexpense/${bucketname}`,
      );
      setBucketData(response.data);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBucketData();
  }, []);

  return (
    <Container>
      <h1>Bucket Details Page {bucketname}</h1>
      {!loading && !error && bucketData && <ExpenseTable data={bucketData} />}
    </Container>
  );
};

export default BudgetHomePage;
