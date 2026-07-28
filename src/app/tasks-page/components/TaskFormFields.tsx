import React from 'react';
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Box,
  Chip,
} from '@mui/material';
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { TaskCategory } from '../utils/taskApi';
import en from '../../i18n/en';

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  displayMap?: Record<string, string>;
  onChange: (event: SelectChangeEvent<string>) => void;
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  displayMap,
  onChange,
}) => (
  <FormControl variant="outlined" fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select value={value} onChange={onChange} label={label}>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {displayMap ? displayMap[option] || option : option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

type CategoryFieldProps = {
  value: string;
  categories: TaskCategory[];
  onChange: (event: SelectChangeEvent<string>) => void;
};

const COLOR_KEY_MAP: Record<string, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  warning: 'warning.main',
  info: 'info.main',
  error: 'error.main',
  default: 'grey.500',
};

export const CategoryField: React.FC<CategoryFieldProps> = ({
  value,
  categories,
  onChange,
}) => (
  <FormControl variant="outlined" fullWidth>
    <InputLabel>{en.tasksPage.form.category}</InputLabel>
    <Select
      value={value}
      onChange={onChange}
      label={en.tasksPage.form.category}
    >
      {categories.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              sx={{
                bgcolor: COLOR_KEY_MAP[cat.colorKey] || 'grey.500',
                width: 12,
                height: 12,
                borderRadius: '50%',
              }}
            />
            {cat.name}
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

type TaskDateFieldProps = {
  value: Dayjs | null;
  label: string;
  onChange: (value: Dayjs | null) => void;
};

export const TaskDateField: React.FC<TaskDateFieldProps> = ({
  value,
  label,
  onChange,
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      sx={{ width: '100%' }}
    />
  </LocalizationProvider>
);

type TaskTimeFieldProps = {
  value: Dayjs | null;
  label: string;
  onChange: (value: Dayjs | null) => void;
};

export const TaskTimeField: React.FC<TaskTimeFieldProps> = ({
  value,
  label,
  onChange,
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <TimePicker
      label={label}
      value={value}
      onChange={onChange}
      sx={{ width: '100%' }}
    />
  </LocalizationProvider>
);
