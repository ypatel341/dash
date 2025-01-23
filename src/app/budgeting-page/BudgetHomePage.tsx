import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Header from './shared-budget-components/Header';

import { BudgetData } from './types/BudgetCategoryTypes';
import BudgetCategoryComponent from './budgetComponents/BudgetCategoryComponent';

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
    <div>
      <Header />

      <h1>Budget Home page</h1>

      {data.map((item) => (
        <BudgetCategoryComponent data={item} />
      ))}
    </div>
  );
};

export default BudgetHomePage;
