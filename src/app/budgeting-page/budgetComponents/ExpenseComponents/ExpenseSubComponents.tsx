import React from 'react';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import {
  ExpenseType,
  expenseTypeOptions,
  ExpensePerson,
  expensePersonOptions,
} from '../../types/BudgetCategoryTypes';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { transformBucketName } from '../../utils/helpers';

type PersonFieldProps = {
  person: ExpensePerson;
  onChange: (event: SelectChangeEvent<ExpensePerson>) => void;
};

export const PersonField: React.FC<PersonFieldProps> = ({
  person,
  onChange,
}) => (
  <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
    <InputLabel>Person</InputLabel>
    <Select id='person-field' value={person} onChange={onChange} label="Person">
      {expensePersonOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

type AmountFieldProps = {
  amount: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const AmountField: React.FC<AmountFieldProps> = ({
  amount,
  onChange,
}) => (
  <TextField
    id='amount-field'
    label="Amount"
    variant="outlined"
    placeholder='0.00'
    value={amount}
    onChange={onChange}
    type="number"
    fullWidth
  />
);

type TypeFieldProps = {
  type: ExpenseType;
  onChange: (event: SelectChangeEvent<ExpenseType>) => void;
};

export const TypeField: React.FC<TypeFieldProps> = ({ type, onChange }) => (
  <FormControl variant="outlined" fullWidth>
    <InputLabel>Type</InputLabel>
    <Select value={type} onChange={onChange} label="Type">
      {expenseTypeOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {transformBucketName(option)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

type VendorFieldProps = {
  vendor: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const VendorField: React.FC<VendorFieldProps> = ({
  vendor,
  onChange,
}) => (
  <TextField
    id='vendor-field'
    label="Vendor"
    variant="outlined"
    value={vendor}
    onChange={onChange}
    fullWidth
  />
);

type DescriptionFieldProps = {
  description?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  description,
  onChange,
}) => (
  <TextField
    data-cy="description-field"
    label="Description"
    variant="outlined"
    value={description}
    onChange={onChange}
    fullWidth
  />
);

type DateFieldProps = {
  date: Dayjs;
  onChange: (newDate: Dayjs | null) => void;
};
export const DateField: React.FC<DateFieldProps> = ({ date, onChange }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box>
      <DatePicker data-cy="date-field" label="Date" value={date} onChange={onChange} />
    </Box>
  </LocalizationProvider>
);
