import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Box,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  ExpensePerson,
  expensePersonOptions,
  ExpenseType,
  expenseTypeOptions,
  ExpenseData,
} from '../types/BudgetCategoryTypes';
import axios from 'axios';
import ToastMessage from '../../customizations/ToastMessages';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export const EnterExpensePage: React.FC = () => {
  const [expense, setExpense] = useState<string>('');
  const [type, setType] = useState<ExpenseType>('rent');
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [person, setPerson] = useState<ExpensePerson>('Both');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>(
    'success',
  );
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [date, setDate] = useState<Dayjs>(dayjs(new Date()));

  const handlePersonChange = (event: SelectChangeEvent<ExpensePerson>) => {
    setPerson(event.target.value as ExpensePerson);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpense(event.target.value);
  };

  const handleVendorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVendor(event.target.value);
  };

  const handleTypeChange = (event: SelectChangeEvent<ExpenseType>) => {
    setType(event.target.value as ExpenseType);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDescription(event.target.value);
  };

  const handleSetDate = (newDate: Dayjs | null) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleButtonClick = async () => {
    console.log('DATE: ', date);
    if (!validateExpense()) {
      return;
    }
    try {
      await postExpense();
    } catch (error) {
      setToastMessage('Error posting expense');
      setToastSeverity('error');
      setShowAlert(true);
      console.error('Error posting expense:', error);
    }
  };

  const validateExpense = (): boolean => {
    if (!person || !type || !vendor || !expense || !description) {
      setToastMessage('All fields are required');
      setToastSeverity('error');
      setShowAlert(true);
      return false;
    }

    if (isNaN(parseInt(expense))) {
      setToastMessage('Amount must be a number');
      setToastSeverity('error');
      setShowAlert(true);
      return false;
    }

    return true;
  };

  const postExpense = async () => {
    const data: ExpenseData = {
      person,
      bucketname: type,
      vendor,
      amount: parseInt(expense),
      description: 'some description',
    };

    if (date) {
      data.date = date.toISOString(); // Format the date for PostgreSQL
    }

    const response = await axios.post(
      'http://localhost:5000/budget/expense',
      data,
    );
    console.log('Response:', response);
    setToastMessage('The Expense was successfully saved');
    setToastSeverity('success');
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <FormControl variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Person</InputLabel>
          <Select value={person} onChange={handlePersonChange} label="Person">
            {expensePersonOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Amount"
          variant="outlined"
          value={expense}
          onChange={handleAmountChange}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Vendor"
          variant="outlined"
          value={vendor}
          onChange={handleVendorChange}
          sx={{ mr: 2 }}
        />
        <FormControl variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={handleTypeChange} label="Type">
            {expenseTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={handleDescriptionChange}
          sx={{ mr: 2 }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box>
            <DatePicker label="Date" value={date} onChange={handleSetDate}/>
          </Box>
        </LocalizationProvider>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={!expense || !type || !description || !vendor}
        >
          Enter
        </Button>
        {showAlert && (
          <ToastMessage
            message={toastMessage}
            severity={toastSeverity}
            onClose={handleCloseAlert}
          />
        )}
      </Box>
    </Container>
  );
};

/**
 * TODO: Implement the EnterExpensePage component.
 * This page should have a header that outlines subheader (netowrth, money in month)
 *  - The Amount field should have validation to allow only numbers - DONE
 *  - the Type field should have a dropdown with options (e.g. groceries, rent, etc.) - DONE
 *  - The Date field should have a date picker - DONE
 *
 *  - There should be some feedback as well about API success or failure - DONE
 *  - the button should be disabled if the fields are not filled out - DONE
 */
