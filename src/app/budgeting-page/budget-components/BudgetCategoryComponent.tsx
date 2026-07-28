import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { BudgetComponentProps } from '../types/BudgetCategoryTypes';
import {
  getMonthFromDate,
  transformBucketName,
  transformCategoryName,
} from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const BudgetCategoryComponent: React.FC<BudgetComponentProps> = ({
  data,
  month,
}) => {
  const navigate = useNavigate();

  const { amount, currentamount } = data;
  const eightyPercentOfAllocatedAmount = amount * 0.8;

  let cardColor = '#4CAF50';
  if (
    (currentamount >= eightyPercentOfAllocatedAmount &&
      currentamount < amount) ||
    currentamount === amount
  ) {
    cardColor = '#FFEB3B';
  } else if (currentamount > amount) {
    cardColor = '#F44336';
  }

  const YYYYMM = getMonthFromDate(month).toLowerCase();

  const navigateTo = () => {
    navigate(`/budget/details/${YYYYMM}/${data.bucketname}`, {
      state: { data },
    });
  };

  return (
    <Card>
      <CardActionArea
        id="budget-card"
        onClick={() => navigateTo()}
        style={{ backgroundColor: cardColor }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            sx={{ color: 'rgba(0, 0, 0, 0.87)' }}
          >
            {transformBucketName(data.bucketname)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Category: {transformCategoryName(data.category)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Amount: ${data.amount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Household: {data.household}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Currently-Using: {data.currentamount}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BudgetCategoryComponent;
