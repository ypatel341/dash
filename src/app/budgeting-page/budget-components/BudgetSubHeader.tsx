import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubHeaderTitles, SubHeaderRoutes } from '../types/BudgetCategoryTypes';

type budgetSubHeaderProps = {
  title: SubHeaderTitles;
};

const BudgetSubHeader: React.FC<budgetSubHeaderProps> = ({ title }) => {
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
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BudgetSubHeader;
