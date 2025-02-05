import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';
import { transformBucketName, transformCategorytName } from '../utils/helpers';

const BudgetCategoryComponent: React.FC<BudgetComponentProps> = ({ data }) => {
  const { amount, currentamount} = data;
  const eightyPercentOfAllocatedAmount = amount * 0.8;

  let cardColor = '#4CAF50';
  if (currentamount >= eightyPercentOfAllocatedAmount && currentamount < amount) {
    cardColor = '#FFEB3B';
  } else if (currentamount > amount) {
    cardColor = '#F44336';
  }

  const doSomething = () => {
    console.log(`some values: ${JSON.stringify(data)}`);
  };

  return (
    <Card>
      <CardActionArea onClick={() => doSomething()} style={{ backgroundColor: cardColor }}>
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
          <Typography variant="body2" color="textSecondary">
            Currently-Using: {data.currentamount}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BudgetCategoryComponent;
