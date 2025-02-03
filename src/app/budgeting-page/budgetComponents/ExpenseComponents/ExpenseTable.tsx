import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { MonthlyExpense } from '../../types/BudgetCategoryTypes';

interface ExpenseTableProps {
  data?: MonthlyExpense[];
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} style={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Expense Date</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Bucket Name</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.slice(0, 100).map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.bucketname}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.expensedate}</TableCell> {/* Convert the timestamptz to just MM/DD/YYYY */}
              <TableCell>{row.person}</TableCell>
              <TableCell>{row.vendor}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpenseTable;