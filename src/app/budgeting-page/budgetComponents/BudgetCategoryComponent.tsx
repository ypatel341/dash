import React from 'react';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';
import { transformBucketName } from '../utils/helpers';

const BudgetCategoryComponent: React.FC<BudgetComponentProps> = ({ data }) => {
  return (
    <div>
      <h1>{transformBucketName(data.bucketname)}</h1>
      <p>{data.category}</p>
      <p>{data.amount}</p>
      <p>{data.household}</p>
    </div>
  );
};

export default BudgetCategoryComponent;
