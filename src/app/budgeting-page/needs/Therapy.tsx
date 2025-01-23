import React from 'react';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';

const Therapy: React.FC<BudgetComponentProps> = ({ data }) => {
  return (
    <div>
      <h1>Therapy</h1>
      <p>{data.category}</p>
      <p>{data.bucketname}</p>
      <p>{data.amount}</p>
    </div>
  );
};

export default Therapy;
