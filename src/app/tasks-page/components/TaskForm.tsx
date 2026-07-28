import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import {
  TaskCategory,
  CreateTaskRequest,
  CreateSeriesRequest,
  createTask,
  createSeries,
  fetchCategories,
} from '../utils/taskApi';
import {
  SelectField,
  CategoryField,
  TaskDateField,
  TaskTimeField,
} from './TaskFormFields';
import en from '../../i18n/en';

const ASSIGNED_TO_OPTIONS = ['Yogi', 'Riddhi', 'Both'] as const;
const KIND_OPTIONS = ['event', 'deadline', 'activity'] as const;
const MODALITY_OPTIONS = ['physical', 'virtual', 'none'] as const;
const TIME_MODE_OPTIONS = ['timed', 'all_day', 'date_only'] as const;
const FREQUENCY_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

type TaskFormData = {
  title: string;
  assignedTo: string;
  categoryId: string;
  kind: string;
  modality: string;
  taskDate: Dayjs | null;
  timeMode: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  location: string;
  description: string;
  recurring: boolean;
  frequency: string;
  startsOn: Dayjs | null;
  endsOn: Dayjs | null;
};

const initialFormData: TaskFormData = {
  title: '',
  assignedTo: 'Yogi',
  categoryId: '',
  kind: 'event',
  modality: 'none',
  taskDate: dayjs(),
  timeMode: 'date_only',
  startTime: null,
  endTime: null,
  location: '',
  description: '',
  recurring: false,
  frequency: 'WEEKLY',
  startsOn: dayjs(),
  endsOn: null,
};

type TaskFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, severity: 'success' | 'error') => void;
};

const buildRRule = (frequency: string, taskDate: Dayjs | null): string => {
  let rule = `FREQ=${frequency}`;
  if (frequency === 'WEEKLY' && taskDate) {
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    rule += `;BYDAY=${dayNames[taskDate.day()]}`;
  }
  if (frequency === 'MONTHLY' && taskDate) {
    rule += `;BYMONTHDAY=${taskDate.date()}`;
  }
  return rule;
};

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories()
        .then(setCategories)
        .catch(() => onToast(en.tasksPage.toast.createError, 'error'));
    }
  }, [open, onToast]);

  const handleInputChange =
    (field: keyof TaskFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSelectChange =
    (field: keyof TaskFormData) => (event: SelectChangeEvent<string>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleDateChange =
    (field: 'taskDate' | 'startsOn' | 'endsOn') => (value: Dayjs | null) => {
      setFormData({ ...formData, [field]: value });
    };

  const handleTimeChange =
    (field: 'startTime' | 'endTime') => (value: Dayjs | null) => {
      setFormData({ ...formData, [field]: value });
    };

  const canSubmit =
    formData.title.trim() !== '' &&
    formData.categoryId !== '' &&
    (formData.recurring
      ? formData.startsOn !== null
      : formData.taskDate !== null) &&
    !(formData.timeMode === 'timed' && !formData.startTime) &&
    !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (formData.recurring) {
        const data: CreateSeriesRequest = {
          assignedTo: formData.assignedTo,
          title: formData.title.trim(),
          categoryId: formData.categoryId,
          kind: formData.kind,
          modality: formData.modality,
          timeMode: formData.timeMode,
          startsOn: formData.startsOn!.format('YYYY-MM-DD'),
          recurrenceRule: buildRRule(formData.frequency, formData.startsOn),
        };
        if (formData.description.trim())
          data.description = formData.description.trim();
        if (formData.location.trim()) data.location = formData.location.trim();
        if (formData.timeMode === 'timed' && formData.startTime)
          data.startTime = formData.startTime.format('HH:mm');
        if (formData.timeMode === 'timed' && formData.endTime)
          data.endTime = formData.endTime.format('HH:mm');
        if (formData.endsOn) data.endsOn = formData.endsOn.format('YYYY-MM-DD');

        await createSeries(data);
      } else {
        const data: CreateTaskRequest = {
          assignedTo: formData.assignedTo,
          title: formData.title.trim(),
          categoryId: formData.categoryId,
          kind: formData.kind,
          modality: formData.modality,
          taskDate: formData.taskDate!.format('YYYY-MM-DD'),
          timeMode: formData.timeMode,
        };
        if (formData.description.trim())
          data.description = formData.description.trim();
        if (formData.location.trim()) data.location = formData.location.trim();
        if (formData.timeMode === 'timed' && formData.startTime)
          data.startTime = formData.startTime.format('HH:mm');
        if (formData.timeMode === 'timed' && formData.endTime)
          data.endTime = formData.endTime.format('HH:mm');

        await createTask(data);
      }

      onToast(en.tasksPage.toast.createSuccess, 'success');
      setFormData(initialFormData);
      onClose();
      onSuccess();
    } catch {
      onToast(en.tasksPage.toast.createError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{en.tasksPage.createTask}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={en.tasksPage.form.title}
            value={formData.title}
            onChange={handleInputChange('title')}
            fullWidth
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <SelectField
                label={en.tasksPage.form.assignedTo}
                value={formData.assignedTo}
                options={ASSIGNED_TO_OPTIONS}
                onChange={handleSelectChange('assignedTo')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CategoryField
                value={formData.categoryId}
                categories={categories}
                onChange={handleSelectChange('categoryId')}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={en.tasksPage.form.kind}
                value={formData.kind}
                options={KIND_OPTIONS}
                displayMap={en.tasksPage.kind}
                onChange={handleSelectChange('kind')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={en.tasksPage.form.modality}
                value={formData.modality}
                options={MODALITY_OPTIONS}
                displayMap={en.tasksPage.modality}
                onChange={handleSelectChange('modality')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={en.tasksPage.form.timeMode}
                value={formData.timeMode}
                options={TIME_MODE_OPTIONS}
                displayMap={en.tasksPage.timeMode}
                onChange={handleSelectChange('timeMode')}
              />
            </Grid>
          </Grid>

          {formData.timeMode === 'timed' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TaskTimeField
                  label={en.tasksPage.form.startTime}
                  value={formData.startTime}
                  onChange={handleTimeChange('startTime')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TaskTimeField
                  label={en.tasksPage.form.endTime}
                  value={formData.endTime}
                  onChange={handleTimeChange('endTime')}
                />
              </Grid>
            </Grid>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.recurring}
                onChange={(e) =>
                  setFormData({ ...formData, recurring: e.target.checked })
                }
              />
            }
            label={en.tasksPage.form.recurring}
          />

          {formData.recurring ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <SelectField
                  label={en.tasksPage.form.frequency}
                  value={formData.frequency}
                  options={FREQUENCY_OPTIONS}
                  displayMap={en.tasksPage.frequency}
                  onChange={handleSelectChange('frequency')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TaskDateField
                  label={en.tasksPage.form.startsOn}
                  value={formData.startsOn}
                  onChange={handleDateChange('startsOn')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TaskDateField
                  label={en.tasksPage.form.endsOn}
                  value={formData.endsOn}
                  onChange={handleDateChange('endsOn')}
                />
              </Grid>
            </Grid>
          ) : (
            <TaskDateField
              label={en.tasksPage.form.taskDate}
              value={formData.taskDate}
              onChange={handleDateChange('taskDate')}
            />
          )}

          <TextField
            label={en.tasksPage.form.location}
            value={formData.location}
            onChange={handleInputChange('location')}
            fullWidth
          />
          <TextField
            label={en.tasksPage.form.description}
            value={formData.description}
            onChange={handleInputChange('description')}
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          <Typography>Cancel</Typography>
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {en.tasksPage.form.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
