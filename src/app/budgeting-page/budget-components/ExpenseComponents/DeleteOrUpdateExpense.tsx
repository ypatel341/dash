import { Divider, Menu, MenuItem, MenuList } from '@mui/material';
import React from 'react';
import {
  MonthlyExpense,
  ToastMessageOptions,
} from '../../types/BudgetCategoryTypes';
import axios from 'axios';

interface DeleteOrUpdateExpenseProps {
  contextMenu: { mouseX: number; mouseY: number } | null;
  handleClose: () => void;
  selectedRow: MonthlyExpense | null;
  handleToastMessage: (messageInfo: ToastMessageOptions) => void;
  refetchData: () => void;
}

const DeleteOrUpdateExpense: React.FC<DeleteOrUpdateExpenseProps> = ({
  contextMenu,
  handleClose,
  selectedRow,
  handleToastMessage,
  refetchData,
}) => {
  const updateExpense = async () => {
    // TODO: Make a modal for edits, right now we want to do it inline
    handleClose();
  };

  const deleteExpense = async () => {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/budget/expense/${selectedRow?.id}`,
    );

    if (response.status !== 200) {
      handleToastMessage({
        message: `Failed to delete expense ${selectedRow?.id}`,
        severity: 'warning',
      });
      return;
    }

    handleToastMessage({
      message: `Expense ${selectedRow?.id} deleted successfully`,
      severity: 'success',
    });
    handleClose();

    refetchData();
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
        <MenuItem onClick={updateExpense}>Update Expense</MenuItem>
        <Divider />
        <MenuItem onClick={deleteExpense} sx={{ color: '#f44336' }}>
          Delete Expense
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DeleteOrUpdateExpense;
