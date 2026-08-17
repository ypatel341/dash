import React, { useCallback, useEffect, useState } from 'react';
import { Container, Box, Typography, Fab, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ToastSeverityOptions } from '../budgeting-page/types/BudgetCategoryTypes';
import ToastMessage from '../customizations/ToastMessages';
import TaskForm from './components/TaskForm';
import TaskDetailDialog from './components/TaskDetailDialog';
import UpcomingTaskList from './components/UpcomingTaskList';
import CalendarView from './components/CalendarView';
import { Task, TaskCategory, fetchCategories } from './utils/taskApi';
import en from '../i18n/en';

const TasksHomePage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] =
    useState<ToastSeverityOptions>('success');
  const [showToast, setShowToast] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      // categories will remain empty; TaskRow/TaskDetailDialog degrade gracefully
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories, refreshKey]);

  const handleToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(null);
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }} data-testid="tasks-home-page">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">{en.tasksPage.header}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <UpcomingTaskList
            refreshKey={refreshKey}
            categories={categories}
            onEdit={handleEdit}
            onToast={handleToast}
            onRowClick={handleRowClick}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CalendarView refreshKey={refreshKey} />
        </Grid>
      </Grid>

      <TaskDetailDialog
        task={selectedTask}
        categories={categories}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TaskForm
        open={formOpen}
        editTask={editingTask}
        onClose={handleFormClose}
        onSuccess={handleRefresh}
        onToast={handleToast}
      />

      <Fab
        color="primary"
        aria-label={en.tasksPage.createTask}
        data-testid="create-task-fab"
        onClick={() => {
          setEditingTask(null);
          setFormOpen(true);
        }}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      {showToast && (
        <ToastMessage
          message={toastMessage}
          severity={toastSeverity}
          onClose={() => setShowToast(false)}
        />
      )}
    </Container>
  );
};

export default TasksHomePage;
