import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
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
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const category = categories.find((c) => c.id === task.categoryId);
  const isOverdue =
    task.status === 'planned' && dayjs(task.taskDate).isBefore(dayjs(), 'day');
  const isCompleted = task.status === 'completed';
  const isCanceled = task.status === 'canceled';
  const isSkipped = task.status === 'skipped';
  const isTerminal = isCompleted || isCanceled;

  const requestAction = (action: string) => {
    if (action === 'delete' || action === 'canceled') {
      setPendingAction(action);
    } else {
      handleAction(action);
    }
  };

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
      data-testid="task-row"
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
                aria-label={en.tasksPage.actions.complete}
                data-testid="task-action-complete"
                size="small"
                color="success"
                onClick={() => requestAction('completed')}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={en.tasksPage.actions.skip}>
              <IconButton
                aria-label={en.tasksPage.actions.skip}
                data-testid="task-action-skip"
                size="small"
                onClick={() => requestAction('skipped')}
              >
                <SkipNextIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={en.tasksPage.actions.cancel}>
              <IconButton
                aria-label={en.tasksPage.actions.cancel}
                data-testid="task-action-cancel"
                size="small"
                color="warning"
                onClick={() => requestAction('canceled')}
              >
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isSkipped && (
          <Tooltip title={en.tasksPage.actions.unskip}>
            <IconButton
              aria-label={en.tasksPage.actions.unskip}
              data-testid="task-action-unskip"
              size="small"
              onClick={() => requestAction('planned')}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {!isTerminal && (
          <Tooltip title={en.tasksPage.actions.delete}>
            <IconButton
              aria-label={en.tasksPage.actions.delete}
              data-testid="task-action-delete"
              size="small"
              color="error"
              onClick={() => requestAction('delete')}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        data-testid="confirm-dialog"
      >
        <DialogTitle>
          {pendingAction === 'delete'
            ? en.tasksPage.confirm.deleteTitle
            : en.tasksPage.confirm.cancelTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction === 'delete'
              ? en.tasksPage.confirm.deleteMessage
              : en.tasksPage.confirm.cancelMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            data-testid="confirm-dialog-cancel"
            onClick={() => setPendingAction(null)}
          >
            {en.tasksPage.confirm.goBack}
          </Button>
          <Button
            data-testid="confirm-dialog-confirm"
            color="error"
            variant="contained"
            onClick={() => {
              if (pendingAction) handleAction(pendingAction);
              setPendingAction(null);
            }}
          >
            {en.tasksPage.confirm.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskRow;
