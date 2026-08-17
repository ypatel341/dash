import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import dayjs from 'dayjs';
import { Task, TaskCategory, fetchTasks } from '../utils/taskApi';
import TaskRow from './TaskRow';
import { SelectField } from './TaskFormFields';
import en from '../../i18n/en';

const LOOK_AHEAD_DAYS = 14;
const ASSIGNED_TO_FILTER = ['All', 'Yogi', 'Riddhi', 'Both'] as const;
const STATUS_FILTER = [
  'All',
  'planned',
  'completed',
  'skipped',
  'canceled',
] as const;

type UpcomingTaskListProps = {
  refreshKey: number;
  categories: TaskCategory[];
  onEdit: (task: Task) => void;
  onToast: (message: string, severity: 'success' | 'error') => void;
  onRowClick?: (task: Task) => void;
};

const UpcomingTaskList: React.FC<UpcomingTaskListProps> = ({
  refreshKey,
  categories,
  onEdit,
  onToast,
  onRowClick,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = dayjs().format('YYYY-MM-DD');
      const to = dayjs().add(LOOK_AHEAD_DAYS, 'day').format('YYYY-MM-DD');
      const statusParam = statusFilter !== 'All' ? statusFilter : undefined;
      const assignedParam =
        assignedToFilter !== 'All' ? assignedToFilter : undefined;

      const taskData = await fetchTasks(from, to, statusParam, assignedParam);
      setTasks(taskData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : en.errors.unknownError);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, assignedToFilter]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleAssignedToChange = (event: SelectChangeEvent<string>) => {
    setAssignedToFilter(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.taskDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(tasksByDate).sort();

  const getDateLabel = (dateStr: string): string => {
    const date = dayjs(dateStr);
    const today = dayjs();
    if (date.isSame(today, 'day')) return en.tasksPage.today;
    return date.format('ddd, MMM D');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box data-testid="task-load-error" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {en.errors.loadFailed}
        </Typography>
        <Button variant="outlined" onClick={loadData}>
          {en.errors.retry}
        </Button>
      </Box>
    );
  }

  return (
    <Box data-testid="upcoming-task-list">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ minWidth: 130 }}>
          <SelectField
            label={en.tasksPage.filterByAssignee}
            value={assignedToFilter}
            options={ASSIGNED_TO_FILTER}
            displayMap={{
              All: en.tasksPage.allAssignees,
            }}
            onChange={handleAssignedToChange}
          />
        </Box>
        <Box sx={{ minWidth: 130 }}>
          <SelectField
            label={en.tasksPage.filterByStatus}
            value={statusFilter}
            options={STATUS_FILTER}
            displayMap={{
              All: en.tasksPage.allStatuses,
              ...en.tasksPage.status,
            }}
            onChange={handleStatusChange}
          />
        </Box>
      </Box>

      {sortedDates.length === 0 ? (
        <Typography
          data-testid="no-tasks-message"
          color="text.secondary"
          sx={{ py: 4, textAlign: 'center' }}
        >
          {en.tasksPage.noTasks}
        </Typography>
      ) : (
        sortedDates.map((date) => (
          <Box key={date} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 0.5, px: 1 }}
            >
              {getDateLabel(date)}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {tasksByDate[date].map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  categories={categories}
                  onUpdate={loadData}
                  onEdit={onEdit}
                  onToast={onToast}
                  onRowClick={onRowClick}
                />
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default UpcomingTaskList;
