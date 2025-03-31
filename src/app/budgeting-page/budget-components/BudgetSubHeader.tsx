import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubHeaderTitles, SubHeaderRoutes } from '../types/BudgetCategoryTypes';
import { formatSubValue } from '../utils/helpers';

type budgetSubHeaderProps = {
  title: SubHeaderTitles;
  subValue?: number;
};

const BudgetSubHeader: React.FC<budgetSubHeaderProps> = ({
  title,
  subValue,
}) => {
  const navigate = useNavigate();

  const navigateTo = () => {
    const route = SubHeaderRoutes[title];
    if (route) {
      navigate(route);
    } else {
      {
        /*TODO: IMPLEMENT AN ERROR PAGE HERE */
      }
      console.error('Route not found');
    }
  };

  return (
    <Card>
      <CardActionArea onClick={() => navigateTo()}>
        <CardContent>
          <Typography variant="h6" component="div">
            {title}
            {formatSubValue(subValue)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BudgetSubHeader;
