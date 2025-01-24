import React from 'react';
import { Outlet } from 'react-router-dom';

const BudgetOutlet: React.FC = () => {
  return (
    // <div>
    //   <h2>Budget Section</h2>
    <Outlet />
    // </div>
  );
};

export default BudgetOutlet;
