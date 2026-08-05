import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import {
  Task,
  TaskCategory,
  CreateTaskRequest,
  CreateSeriesRequest,
  createTask,
  createSeries,
  updateTask,
  updateSeries,
  fetchCategories,
  fetchSeries,
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

type EditScope = 'occurrence' | 'series';

type TaskFormProps = {
  open: boolean;
  editTask?: Task | null;
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

const parseFrequencyFromRRule = (rule: string): string => {
  const match = rule.match(/FREQ=(\w+)/);
  return match ? match[1] : 'WEEKLY';
};

const taskToFormData = (task: Task): TaskFormData => ({
  title: task.title,
  assignedTo: task.assignedTo,
  categoryId: task.categoryId,
  kind: task.kind,
  modality: task.modality,
  taskDate: dayjs(task.taskDate),
  timeMode: task.timeMode,
  startTime: task.startTime ? dayjs(`2000-01-01 ${task.startTime}`) : null,
  endTime: task.endTime ? dayjs(`2000-01-01 ${task.endTime}`) : null,
  location: task.location || '',
  description: task.description || '',
  recurring: !!task.seriesId,
  frequency: 'WEEKLY',
  startsOn: dayjs(task.taskDate),
  endsOn: null,
});

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  editTask,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editScope, setEditScope] = useState<EditScope>('occurrence');
  const [showScopeDialog, setShowScopeDialog] = useState(false);

  const isEditing = !!editTask;
  const isRecurringEdit = isEditing && !!editTask?.seriesId;

  useEffect(() => {
    if (open) {
      fetchCategories()
        .then(setCategories)
        .catch(() => onToast(en.tasksPage.toast.createError, 'error'));

      if (editTask) {
        const data = taskToFormData(editTask);
        if (editTask.seriesId) {
          fetchSeries(editTask.seriesId)
            .then((series) => {
              setFormData({
                ...data,
                frequency: parseFrequencyFromRRule(series.recurrenceRule),
                startsOn: dayjs(series.startsOn),
                endsOn: series.endsOn ? dayjs(series.endsOn) : null,
              });
            })
            .catch(() => setFormData(data));
        } else {
          setFormData(data);
        }
        setEditScope('occurrence');
      } else {
        setFormData(initialFormData);
      }
    }
  }, [open, editTask, onToast]);

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

  const handleEditSubmit = () => {
    if (isRecurringEdit) {
      setShowScopeDialog(true);
    } else {
      submitEdit('occurrence');
    }
  };

  const submitEdit = async (scope: EditScope) => {
    setShowScopeDialog(false);
    setSubmitting(true);
    try {
      if (scope === 'series' && editTask?.seriesId) {
        const data: Record<string, unknown> = {
          title: formData.title.trim(),
          assignedTo: formData.assignedTo,
          categoryId: formData.categoryId,
          kind: formData.kind,
          modality: formData.modality,
          timeMode: formData.timeMode,
        };
        if (formData.description.trim())
          data.description = formData.description.trim();
        else data.description = null;
        if (formData.location.trim()) data.location = formData.location.trim();
        else data.location = null;
        if (formData.timeMode === 'timed' && formData.startTime)
          data.startTime = formData.startTime.format('HH:mm');
        else data.startTime = null;
        if (formData.timeMode === 'timed' && formData.endTime)
          data.endTime = formData.endTime.format('HH:mm');
        else data.endTime = null;
        if (formData.startsOn)
          data.startsOn = formData.startsOn.format('YYYY-MM-DD');
        data.recurrenceRule = buildRRule(formData.frequency, formData.startsOn);
        if (formData.endsOn)
          data.endsOn = formData.endsOn.format('YYYY-MM-DD');
        else data.endsOn = null;

        await updateSeries(editTask.seriesId, data);
        onToast(en.tasksPage.toast.seriesUpdateSuccess, 'success');
      } else if (editTask) {
        const data: Partial<Task> = {
          title: formData.title.trim(),
          assignedTo: formData.assignedTo,
          categoryId: formData.categoryId,
          kind: formData.kind,
          modality: formData.modality,
          timeMode: formData.timeMode,
          taskDate: formData.taskDate?.format('YYYY-MM-DD'),
          description: formData.description.trim() || null,
          location: formData.location.trim() || null,
          startTime:
            formData.timeMode === 'timed' && formData.startTime
              ? formData.startTime.format('HH:mm')
              : null,
          endTime:
            formData.timeMode === 'timed' && formData.endTime
              ? formData.endTime.format('HH:mm')
              : null,
        };
        await updateTask(editTask.id, data);
        onToast(en.tasksPage.toast.updateSuccess, 'success');
      }
      setFormData(initialFormData);
      onClose();
      onSuccess();
    } catch {
      onToast(en.tasksPage.toast.updateError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
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

  const handleSubmit = isEditing ? handleEditSubmit : handleCreateSubmit;

  const handleClose = () => {
    setFormData(initialFormData);
    setShowScopeDialog(false);
    onClose();
  };

  const dialogTitle = isEditing
    ? isRecurringEdit
      ? en.tasksPage.form.editSeries
      : en.tasksPage.form.editTask
    : en.tasksPage.createTask;

  const showRecurrenceControls = isEditing
    ? editScope === 'series' && isRecurringEdit
    : formData.recurring;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        data-testid="task-form-dialog"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
          >
            <TextField
              label={en.tasksPage.form.title}
              value={formData.title}
              onChange={handleInputChange('title')}
              fullWidth
              required
              data-testid="task-title-input"
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

            {!isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.recurring}
                    data-testid="task-recurring-toggle"
                    onChange={(e) =>
                      setFormData({ ...formData, recurring: e.target.checked })
                    }
                  />
                }
                label={en.tasksPage.form.recurring}
              />
            )}

            {showRecurrenceControls ? (
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
              data-testid="task-location-input"
            />
            <TextField
              label={en.tasksPage.form.description}
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              minRows={2}
              data-testid="task-description-input"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button data-testid="task-form-cancel" onClick={handleClose}>
            {en.tasksPage.actions.cancel}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="task-form-submit"
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {en.tasksPage.form.submit}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showScopeDialog}
        onClose={() => setShowScopeDialog(false)}
        data-testid="edit-scope-dialog"
      >
        <DialogTitle>{en.tasksPage.editScope.title}</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel sx={{ mb: 1 }}>{en.tasksPage.editScope.title}</FormLabel>
            <RadioGroup
              value={editScope}
              onChange={(e) => setEditScope(e.target.value as EditScope)}
            >
              <FormControlLabel
                value="occurrence"
                control={<Radio />}
                label={en.tasksPage.editScope.thisOccurrence}
                data-testid="edit-scope-occurrence"
              />
              <FormControlLabel
                value="series"
                control={<Radio />}
                label={en.tasksPage.editScope.entireSeries}
                data-testid="edit-scope-series"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScopeDialog(false)}>
            {en.tasksPage.confirm.goBack}
          </Button>
          <Button
            variant="contained"
            data-testid="edit-scope-confirm"
            onClick={() => submitEdit(editScope)}
          >
            {en.tasksPage.confirm.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskForm;
