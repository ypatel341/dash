import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import VideocamIcon from '@mui/icons-material/Videocam';
import RepeatIcon from '@mui/icons-material/Repeat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
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

const TodayTasksCard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const [taskData, catData] = await Promise.all([
          fetchTasks(today, today, 'planned'),
          fetchCategories(),
        ]);
        setTasks(taskData);
        setCategories(catData);
      } catch {
        // Card is non-critical; fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryColor = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? COLOR_KEY_MAP[cat.colorKey] || 'grey.500' : 'grey.500';
  };

  const getCategoryName = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '';
  };

  if (loading) {
    return (
      <Card sx={{ maxWidth: 480, mx: 'auto' }}>
        <CardContent>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="rounded" height={40} sx={{ mt: 1 }} />
          <Skeleton variant="rounded" height={40} sx={{ mt: 0.5 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="today-tasks-card" sx={{ maxWidth: 480, mx: 'auto' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6">
            {en.tasksPage.today} &middot; {tasks.length}{' '}
            {tasks.length === 1
              ? en.tasksPage.taskSingular
              : en.tasksPage.taskPlural}
          </Typography>
        </Box>

        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {en.tasksPage.noTasksToday}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {tasks.slice(0, 4).map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getCategoryColor(task.categoryId),
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {task.title}
                </Typography>
                {task.timeMode === 'timed' && task.startTime && (
                  <Typography variant="caption" color="text.secondary">
                    {task.startTime.slice(0, 5)}
                  </Typography>
                )}
                {task.seriesId && (
                  <RepeatIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                )}
                {task.modality === 'physical' && (
                  <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                )}
                {task.modality === 'virtual' && (
                  <VideocamIcon
                    sx={{ fontSize: 14, color: 'text.secondary' }}
                  />
                )}
                <Chip
                  size="small"
                  label={getCategoryName(task.categoryId)}
                  sx={{
                    bgcolor: getCategoryColor(task.categoryId),
                    color: 'white',
                    fontSize: 10,
                    height: 20,
                  }}
                />
              </Box>
            ))}
            {tasks.length > 4 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ pl: 1 }}
              >
                {en.tasksPage.moreCount(tasks.length - 4)}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
      <CardActionArea
        data-testid="today-tasks-view-all"
        onClick={() => navigate('/tasks')}
        sx={{ py: 1 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <Typography variant="body2" color="primary">
            {en.tasksPage.viewAll}
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default TodayTasksCard;
