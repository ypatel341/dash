import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import VideocamIcon from '@mui/icons-material/Videocam';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Task, TaskCategory, TaskSeries, fetchSeries } from '../utils/taskApi';
import { COLOR_KEY_MAP } from './TaskRow';
import en from '../../i18n/en';
import dayjs from 'dayjs';

const parseRecurrenceSummary = (rule: string): string => {
  const freqMatch = rule.match(/FREQ=(\w+)/);
  const freq = freqMatch ? freqMatch[1] : '';
  const intervalMatch = rule.match(/INTERVAL=(\d+)/);
  const interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

  if (freq === 'MONTHLY' && interval === 6) return 'Every 6 months';

  const summaryMap: Record<string, string> = en.tasksPage.recurrenceSummary;
  return summaryMap[freq] || freq;
};

type TaskDetailDialogProps = {
  task: Task | null;
  categories: TaskCategory[];
  open: boolean;
  onClose: () => void;
};

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  categories,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [series, setSeries] = useState<TaskSeries | null>(null);

  useEffect(() => {
    if (open && task?.seriesId) {
      fetchSeries(task.seriesId)
        .then(setSeries)
        .catch(() => setSeries(null));
    } else {
      setSeries(null);
    }
  }, [open, task?.seriesId]);

  if (!task) return null;

  const category = categories.find((c) => c.id === task.categoryId);
  const isOverdue =
    task.status === 'planned' && dayjs(task.taskDate).isBefore(dayjs(), 'day');
  const isCompleted = task.status === 'completed';
  const isCanceled = task.status === 'canceled';
  const isSkipped = task.status === 'skipped';

  const statusChip = () => {
    if (isOverdue)
      return <Chip size="small" label={en.tasksPage.overdue} color="error" />;
    if (isCompleted)
      return (
        <Chip
          size="small"
          label={en.tasksPage.status.completed}
          color="success"
        />
      );
    if (isCanceled)
      return (
        <Chip
          size="small"
          label={en.tasksPage.status.canceled}
          color="default"
        />
      );
    if (isSkipped)
      return (
        <Chip
          size="small"
          label={en.tasksPage.status.skipped}
          color="default"
        />
      );
    return (
      <Chip
        size="small"
        label={en.tasksPage.status.planned}
        color="primary"
        variant="outlined"
      />
    );
  };

  const modalityLabel = () => {
    if (task.modality === 'physical')
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PlaceIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {en.tasksPage.modality.physical}
          </Typography>
        </Box>
      );
    if (task.modality === 'virtual')
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VideocamIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {en.tasksPage.modality.virtual}
          </Typography>
        </Box>
      );
    return (
      <Typography variant="body2">{en.tasksPage.modality.none}</Typography>
    );
  };

  const kindLabel =
    en.tasksPage.kind[task.kind as keyof typeof en.tasksPage.kind] || task.kind;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      data-testid="task-detail-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h6" component="span" sx={{ flex: 1, minWidth: 0 }}>
          {task.title}
        </Typography>
        <IconButton
          aria-label={en.tasksPage.detail.close}
          onClick={onClose}
          data-testid="task-detail-close"
          edge="end"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {statusChip()}
            {!!task.seriesId && (
              <RepeatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            )}
          </Box>

          <DetailRow label={en.tasksPage.detail.date}>
            <Typography variant="body2">
              {dayjs(task.taskDate).format('dddd, MMM D, YYYY')}
            </Typography>
          </DetailRow>

          {task.timeMode === 'timed' && task.startTime && (
            <DetailRow label={en.tasksPage.detail.time}>
              <Typography variant="body2">
                {task.startTime}
                {task.endTime && ` – ${task.endTime}`}
              </Typography>
            </DetailRow>
          )}

          {category && (
            <DetailRow label={en.tasksPage.detail.category}>
              <Chip
                size="small"
                label={category.name}
                sx={{
                  bgcolor: COLOR_KEY_MAP[category.colorKey] || 'grey.500',
                  color: 'white',
                  fontWeight: 500,
                }}
              />
            </DetailRow>
          )}

          <DetailRow label={en.tasksPage.detail.assignee}>
            <Typography variant="body2">{task.assignedTo}</Typography>
          </DetailRow>

          <DetailRow label={en.tasksPage.detail.modality}>
            {modalityLabel()}
          </DetailRow>

          <DetailRow label={en.tasksPage.detail.kind}>
            <Typography variant="body2">{kindLabel}</Typography>
          </DetailRow>

          {task.location && (
            <DetailRow label={en.tasksPage.detail.location}>
              <Typography variant="body2">{task.location}</Typography>
            </DetailRow>
          )}

          {task.description && (
            <DetailRow label={en.tasksPage.detail.description}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.description}
              </Typography>
            </DetailRow>
          )}

          {series && (
            <>
              <Divider />
              <DetailRow label={en.tasksPage.detail.recurrence}>
                <Typography variant="body2">
                  {parseRecurrenceSummary(series.recurrenceRule)}
                </Typography>
              </DetailRow>
              <DetailRow label={en.tasksPage.detail.seriesStatus}>
                <Chip
                  size="small"
                  label={series.status}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </DetailRow>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.25 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

export default TaskDetailDialog;
