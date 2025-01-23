import React, { useEffect, useState } from 'react';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';

const Savings: React.FC<BudgetComponentProps> = ({ data }) => {
  return (
    <div>
      <h1>Savings</h1>
      <p>{data.category}</p>
      <p>{data.bucketname}</p>
      <p>{data.amount}</p>
      <p>{data.household}</p>
    </div>
  );
};

export default Savings;
