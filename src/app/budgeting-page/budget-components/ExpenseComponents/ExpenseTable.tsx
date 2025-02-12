import React, { useState, MouseEvent } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { MonthlyExpense, ToastMessageOptions } from '../../types/BudgetCategoryTypes';
import DeleteOrUpdateExpense from './DeleteOrUpdateExpense';

interface ExpenseTableProps {
  data?: MonthlyExpense[];
  handleToastMessage: (messageInfo: ToastMessageOptions) => void;
  refetchData: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data, handleToastMessage, refetchData }) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<MonthlyExpense | null>(null);

  const handleRightClick = (event: MouseEvent, expense: MonthlyExpense) => {
    event.preventDefault();
    setSelectedExpense(expense);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
    setSelectedExpense(null);
  };

  return (
    <TableContainer id="expense-table" component={Paper} style={{ maxHeight: 400 }}>
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
            <TableRow key={index} onContextMenu={(event) => handleRightClick(event, row)}>
              <TableCell>{row.expensedate}</TableCell>
              <TableCell>{row.person}</TableCell>
              <TableCell>{row.vendor}</TableCell>
              <TableCell>{row.bucketname}</TableCell>{' '}
              {/* Convert the timestamptz to just MM/DD/YYYY */}
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteOrUpdateExpense
        contextMenu={contextMenu}
        handleClose={handleClose}
        selectedRow={selectedExpense}
        handleToastMessage={handleToastMessage}
        refetchData={refetchData}
      />
    </TableContainer>
  );
};

export default ExpenseTable;
