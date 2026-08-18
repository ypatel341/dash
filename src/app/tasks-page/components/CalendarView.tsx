import React, { useEffect, useState } from 'react';
import { Badge, Box, Skeleton, Typography } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import {
  Task,
  TaskCategory,
  fetchTasks,
  fetchCategories,
} from '../utils/taskApi';
import en from '../../i18n/en';

const COLOR_KEY_MAP: Record<string, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  warning: 'warning.main',
  info: 'info.main',
  error: 'error.main',
  default: 'grey.500',
};

type TaskDayProps = PickersDayProps<Dayjs> & {
  taskDates: Record<string, string[]>;
};

const TaskDay: React.FC<TaskDayProps> = ({ taskDates, day, ...other }) => {
  const dateStr = day.format('YYYY-MM-DD');
  const colorKeys = taskDates[dateStr] || [];

  return (
    <Badge
      overlap="circular"
      variant="dot"
      invisible={colorKeys.length === 0}
      sx={{
        '& .MuiBadge-dot': {
          bgcolor: colorKeys.length > 0 ? colorKeys[0] : undefined,
          width: 6,
          height: 6,
          minWidth: 6,
        },
      }}
    >
      <PickersDay day={day} {...other} />
    </Badge>
  );
};

type CalendarViewProps = {
  onDateSelect?: (date: string) => void;
  refreshKey: number;
};

const CalendarView: React.FC<CalendarViewProps> = ({
  onDateSelect,
  refreshKey,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);

  const loadMonth = async (month: Dayjs) => {
    setLoading(true);
    try {
      const from = month.startOf('month').format('YYYY-MM-DD');
      const to = month.endOf('month').format('YYYY-MM-DD');
      const [taskData, catData] = await Promise.all([
        fetchTasks(from, to),
        fetchCategories(),
      ]);
      setTasks(taskData);
      setCategories(catData);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth, refreshKey]);

  useEffect(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    setDayTasks(tasks.filter((t) => t.taskDate === dateStr));
  }, [selectedDate, tasks]);

  const getCategoryColorKey = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? COLOR_KEY_MAP[cat.colorKey] || 'grey.500' : 'grey.500';
  };

  const taskDates: Record<string, string[]> = {};
  tasks.forEach((t) => {
    if (!taskDates[t.taskDate]) taskDates[t.taskDate] = [];
    const color = getCategoryColorKey(t.categoryId);
    if (!taskDates[t.taskDate].includes(color)) {
      taskDates[t.taskDate].push(color);
    }
  });

  const handleMonthChange = (month: Dayjs) => {
    setCurrentMonth(month);
  };

  const handleYearChange = (year: Dayjs) => {
    setCurrentMonth(year);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date.format('YYYY-MM-DD'));
    }
  };

  return (
    <Box data-testid="calendar-view">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          loading={loading}
          renderLoading={() => (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rounded" height={240} />
            </Box>
          )}
          slots={{
            day: TaskDay as React.ComponentType<PickersDayProps<Dayjs>>,
          }}
          slotProps={{ day: { taskDates } as Record<string, unknown> }}
        />
      </LocalizationProvider>

      <Box data-testid="calendar-day-detail" sx={{ px: 2, pb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          {selectedDate.format('ddd, MMM D')}
        </Typography>
        {dayTasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {en.tasksPage.noTasksOnDay}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {dayTasks.map((task) => (
              <Box
                key={task.id}
                data-testid="calendar-day-task"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  borderLeft: 3,
                  borderColor: getCategoryColorKey(task.categoryId),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    textDecoration:
                      task.status === 'completed' ? 'line-through' : 'none',
                    opacity:
                      task.status === 'completed' || task.status === 'canceled'
                        ? 0.5
                        : 1,
                  }}
                >
                  {task.title}
                </Typography>
                {task.timeMode === 'timed' && task.startTime && (
                  <Typography variant="caption" color="text.secondary">
                    {task.startTime.slice(0, 5)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {en.tasksPage.status[
                    task.status as keyof typeof en.tasksPage.status
                  ] || task.status}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CalendarView;
