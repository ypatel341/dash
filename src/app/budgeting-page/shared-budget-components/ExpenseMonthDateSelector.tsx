import React from 'react';
// import { TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

interface ExpenseMonthDateSelectorProps {
  label: string;
  minDate: Dayjs;
  maxDate: Dayjs;
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  onAccept: (date: Dayjs | null) => void;
}

// Consider moving the API call in here and also passing in some sort of callback to update the data
// Also a flag to have it return the data formatted || as raw expenses || as bucket expenses

const ExpenseMonthDateSelector: React.FC<ExpenseMonthDateSelectorProps> = ({
  label,
  minDate,
  maxDate,
  value,
  onChange,
  onAccept,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={['year', 'month']}
        label={label}
        minDate={minDate}
        maxDate={maxDate}
        value={value}
        onChange={onChange}
        onAccept={onAccept}
      />
    </LocalizationProvider>
  );
};

export default ExpenseMonthDateSelector;
