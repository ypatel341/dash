import React from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UndoIcon from '@mui/icons-material/Undo';
import PlaceIcon from '@mui/icons-material/Place';
import VideocamIcon from '@mui/icons-material/Videocam';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Task, TaskCategory, updateTask, deleteTask } from '../utils/taskApi';
import en from '../../i18n/en';
import dayjs from 'dayjs';

const COLOR_KEY_MAP: Record<string, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  warning: 'warning.main',
  info: 'info.main',
  error: 'error.main',
  default: 'grey.500',
};

type TaskRowProps = {
  task: Task;
  categories: TaskCategory[];
  onUpdate: () => void;
  onToast: (message: string, severity: 'success' | 'error') => void;
};

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  categories,
  onUpdate,
  onToast,
}) => {
  const category = categories.find((c) => c.id === task.categoryId);
  const isOverdue =
    task.status === 'planned' && dayjs(task.taskDate).isBefore(dayjs(), 'day');
  const isCompleted = task.status === 'completed';
  const isCanceled = task.status === 'canceled';
  const isSkipped = task.status === 'skipped';
  const isTerminal = isCompleted || isCanceled;

  const handleAction = async (action: string) => {
    try {
      if (action === 'delete') {
        await deleteTask(task.id);
        onToast(en.tasksPage.toast.deleteSuccess, 'success');
      } else {
        await updateTask(task.id, { status: action });
        onToast(en.tasksPage.toast.updateSuccess, 'success');
      }
      onUpdate();
    } catch {
      onToast(
        action === 'delete'
          ? en.tasksPage.toast.deleteError
          : en.tasksPage.toast.updateError,
        'error',
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        opacity: isTerminal ? 0.5 : 1,
        textDecoration: isCompleted ? 'line-through' : 'none',
      }}
    >
      {category && (
        <Chip
          size="small"
          label={category.name}
          sx={{
            bgcolor: COLOR_KEY_MAP[category.colorKey] || 'grey.500',
            color: 'white',
            fontWeight: 500,
            minWidth: 70,
          }}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </Typography>
          {task.seriesId && (
            <RepeatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {task.timeMode === 'timed' && task.startTime && (
            <Typography variant="caption" color="text.secondary">
              {task.startTime}
              {task.endTime && ` – ${task.endTime}`}
            </Typography>
          )}
          {task.modality === 'physical' && (
            <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          )}
          {task.modality === 'virtual' && (
            <VideocamIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          )}
          {task.location && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {task.location}
            </Typography>
          )}
        </Box>
      </Box>

      <Chip
        size="small"
        label={task.assignedTo}
        variant="outlined"
        sx={{ fontSize: 11 }}
      />

      {isOverdue && (
        <Chip
          size="small"
          label={en.tasksPage.overdue}
          color="error"
          sx={{ fontSize: 11 }}
        />
      )}

      {isSkipped && (
        <Chip
          size="small"
          label={en.tasksPage.status.skipped}
          color="default"
          sx={{ fontSize: 11 }}
        />
      )}

      {isCompleted && (
        <Chip
          size="small"
          label={en.tasksPage.status.completed}
          color="success"
          sx={{ fontSize: 11 }}
        />
      )}

      {isCanceled && (
        <Chip
          size="small"
          label={en.tasksPage.status.canceled}
          color="default"
          sx={{ fontSize: 11 }}
        />
      )}

      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {task.status === 'planned' && (
          <>
            <Tooltip title={en.tasksPage.actions.complete}>
              <IconButton
                size="small"
                color="success"
                onClick={() => handleAction('completed')}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={en.tasksPage.actions.skip}>
              <IconButton size="small" onClick={() => handleAction('skipped')}>
                <SkipNextIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={en.tasksPage.actions.cancel}>
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleAction('canceled')}
              >
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isSkipped && (
          <Tooltip title={en.tasksPage.actions.unskip}>
            <IconButton size="small" onClick={() => handleAction('planned')}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {!isTerminal && (
          <Tooltip title={en.tasksPage.actions.delete}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleAction('delete')}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default TaskRow;
