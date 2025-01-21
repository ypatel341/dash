import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BudgetCategoryResponse } from '../types/BudgetCategoryTypes';

const Gas: React.FC = () => {
  const [data, setData] = useState<BudgetCategoryResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/budget/needs/gas')
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
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Gas</h1>
      <p>{data?.category}</p>
      <p>{data?.bucketName}</p>
      <p>{data?.budget}</p>
    </div>
  );
};

export default Gas;
