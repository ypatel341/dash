import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import ExpenseTable from '../ExpenseComponents/ExpenseTable';
import {
  MonthlyExpense,
  ToastMessageOptions,
} from '../../types/BudgetCategoryTypes';
import { formatMonthlyExpensesExpenseDate } from '../../utils/helpers';
import ToastMessage from '../../../customizations/ToastMessages';
import en from '../../../i18n/en';

const ExpenseDetailsHomePage: React.FC = () => {
  // const location = useLocation();
  // const data = location.state?.data as BudgetData;
  // console.log(data);
  const { bucketname, YYYYMM } = useParams<{
    bucketname: string;
    YYYYMM: string;
  }>();

  const [bucketData, setBucketData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<ToastMessageOptions | null>(
    null,
  );

  const handleToastMessage = (messageInfo: ToastMessageOptions) => {
    setToastMessage(messageInfo);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const url = YYYYMM
    ? `${process.env.REACT_APP_API_URL}/budget/info/bucketexpense/${bucketname}?YYYYMM=${YYYYMM}`
    : `${process.env.REACT_APP_API_URL}/budget/info/bucketexpense/${bucketname}`;

  const fetchBucketData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url);

      const { data } = response;
      const formattedData = await formatMonthlyExpensesExpenseDate(data);

      setBucketData(formattedData);
      setLoading(false);
    } catch (error: unknown) {
      error instanceof Error
        ? setError(error.message)
        : setError(en.errors.unknownError);
      setLoading(false);
      handleToastMessage({
        message: 'Failed to fetch bucket data',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchBucketData();
  }, [bucketname]);

  return (
    <Container>
      <h1>Bucket Details Page {bucketname}</h1>
      {!loading && !error && bucketData && (
        <ExpenseTable
          data={bucketData}
          handleToastMessage={handleToastMessage}
          refetchData={fetchBucketData}
        />
      )}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {toastMessage && (
        <ToastMessage
          message={toastMessage.message}
          severity={toastMessage.severity}
          onClose={() => setToastMessage(null)}
        />
      )}
    </Container>
  );
};

export default ExpenseDetailsHomePage;
