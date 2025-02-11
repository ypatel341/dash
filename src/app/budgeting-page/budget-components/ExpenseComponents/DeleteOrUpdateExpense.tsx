import { Divider, Menu, MenuItem, MenuList } from '@mui/material';
import React from 'react';
import { MonthlyExpense } from '../../types/BudgetCategoryTypes';

interface DeleteOrUpdateExpenseProps {
  contextMenu: { mouseX: number; mouseY: number } | null;
  handleClose: () => void;
  selectedRow: MonthlyExpense | null;
}

const DeleteOrUpdateExpense: React.FC<DeleteOrUpdateExpenseProps> = ({
  contextMenu,
  handleClose,
  selectedRow
}) => {
  const updateExpense = () => {
    console.log('Update Expense');
  };

  const deleteExpense = () => {
    console.log(`Delete Expense ${selectedRow?.id}`);
  };

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuList
        autoFocusItem={false}
        sx={{
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <MenuItem autoFocus={false} onClick={updateExpense}>
          Update Expense
        </MenuItem>
        <Divider />
        <MenuItem onClick={deleteExpense} sx={{ color: '#f44336' }}>
          Delete Expense
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DeleteOrUpdateExpense;
