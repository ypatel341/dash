import React from 'react';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';

const Gifts: React.FC<BudgetComponentProps> = ({ data }) => {
  return (
    <div>
      <h1>Gifts</h1>
      <p>{data.category}</p>
      <p>{data.bucketname}</p>
      <p>{data.amount}</p>
      <p>{data.household}</p>
    </div>
  );
};

export default Gifts;
