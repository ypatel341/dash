import React, { useState, MouseEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import {
  expenseTypeOptionsMapping,
  MonthlyExpense,
  ToastMessageOptions,
} from '../../types/BudgetCategoryTypes';
import DeleteOrUpdateExpense from './DeleteOrUpdateExpense';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

interface ExpenseTableProps {
  data?: MonthlyExpense[];
  handleToastMessage: (messageInfo: ToastMessageOptions) => void;
  refetchData: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  data,
  handleToastMessage,
  refetchData,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<MonthlyExpense | null>(
    null,
  );
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedData, setEditedData] = useState<MonthlyExpense | null>(null);

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

  const handleEditClick = (id: string) => {
    setEditMode((prev) => ({ ...prev, [id]: true }));
    const expense = data?.find((expense) => expense.id === id);
    setEditedData(expense || null);
  };

  const handleSaveClick = async (id: string) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/budget/expense/${id}`,
        editedData,
      );

      handleToastMessage({
        message: `Expense ${id} updated successfully`,
        severity: 'info',
      });
      setEditMode((prev) => ({ ...prev, [id]: false }));
      setEditedData(null);
      refetchData();
    } catch (error) {
      handleToastMessage({
        message: `Failed to update expense ${id}`,
        severity: 'error',
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditedData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <TableContainer
      id="expense-table"
      component={Paper}
      style={{ maxHeight: 400 }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Expense Date</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Bucket Name</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.slice(0, 100).map((row, index) => (
            <TableRow
              key={index}
              onContextMenu={(event) => handleRightClick(event, row)}
            >
              <TableCell>
                {editMode[row.id] ? (
                  <TextField
                    disabled={true} // Should be a date picker in the future
                    value={editedData?.expensedate || ''}
                    onChange={(e) =>
                      handleInputChange('expensedate', e.target.value)
                    }
                  />
                ) : (
                  row.expensedate
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <TextField
                    value={editedData?.person || ''}
                    onChange={(e) =>
                      handleInputChange('person', e.target.value)
                    }
                  />
                ) : (
                  row.person
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <TextField
                    value={editedData?.vendor || ''}
                    onChange={(e) =>
                      handleInputChange('vendor', e.target.value)
                    }
                  />
                ) : (
                  row.vendor
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <Select
                    value={editedData?.bucketname || ''}
                    onChange={(e) =>
                      handleInputChange('bucketname', e.target.value)
                    } // Handle changes
                    fullWidth
                  >
                    {Object.entries(expenseTypeOptionsMapping).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                ) : (
                  row.bucketname
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <TextField
                    value={editedData?.amount || ''}
                    onChange={(e) =>
                      handleInputChange('amount', e.target.value)
                    }
                  />
                ) : (
                  row.amount
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <TextField
                    value={editedData?.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                  />
                ) : (
                  row.description
                )}
              </TableCell>
              <TableCell>
                {editMode[row.id] ? (
                  <IconButton onClick={() => handleSaveClick(row.id)}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleEditClick(row.id)}>
                    <EditIcon />
                  </IconButton>
                )}
              </TableCell>
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
