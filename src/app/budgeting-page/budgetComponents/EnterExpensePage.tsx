import React, { useState } from 'react';
import { TextField, Button, Container, Box, FormControl, MenuItem, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { ExpensePerson, expensePersonOptions, ExpenseType, expenseTypeOptions } from '../types/BudgetCategoryTypes';
import axios from 'axios';

export const EnterExpensePage: React.FC = () => {
  const [person, setPerson] = useState<ExpensePerson>('Both');
  const [expense, setExpense] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [type, setType] = useState<ExpenseType>('rent');
  const [date, setDate] = useState<string>('');

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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  }
  
  const handleButtonClick = async () => {
    // Add Validation logic here
    // validateExpense();
    console.log('Entered Expense:', expense, date, type);
    try {
      postExpense();
    } catch (error) {
      console.error('Error posting expense:', error);
    }
  };

  const postExpense = async () => {
    const data = {
      person,
      bucketname: type,
      vendor,
      amount: parseInt(expense),
      description: 'some description',
    };

    try {
      const response = await axios.post('http://localhost:5000/budget/expense', data);
      console.log('Response:', response);
    } catch (error) {
      console.error('Error posting expense:', error);
    }
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
          label="Date"
          variant="outlined"
          value={date}
          onChange={handleDateChange}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleButtonClick}>
          Enter
        </Button>
      </Box>
    </Container>
  );
};



/**
 * TODO: Implement the EnterExpensePage component.
 * This page should have a header that outlines subheader (netowrth, money in month)
 *  - The Amount field should have validation to allow only numbers
 *  - the Type field should have a dropdown with options (e.g. groceries, rent, etc.)
 *  - The Date field should have a date picker
 * 
 *  - There should be some feedback as well about API success or failure
 *  - the button should be disabled if the fields are not filled out
 */