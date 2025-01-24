import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';
import { transformBucketName, transformCategorytName } from '../utils/helpers';

const BudgetCategoryComponent: React.FC<BudgetComponentProps> = ({ data }) => {
  const doSomething = () => {
    console.log(`some values: ${JSON.stringify(data)}`);
  };

  return (
    <Card>
      <CardActionArea onClick={() => doSomething()}>
        <CardContent>
          <Typography variant="h5" component="div">
            {transformBucketName(data.bucketname)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Category: {transformCategorytName(data.category)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Amount: ${data.amount}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Household: {data.household}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BudgetCategoryComponent;
