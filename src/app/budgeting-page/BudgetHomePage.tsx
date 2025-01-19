import React from 'react';
import Header from './shared-budget-components/Header';
import ClothesComponent from './clothes/Clothes';

const BudgetHomePage: React.FC = () => {
  return (
    <div>
      <Header />
      <h1>Budget Home page</h1>
      <ClothesComponent />
    </div>
  );
};

export default BudgetHomePage;
