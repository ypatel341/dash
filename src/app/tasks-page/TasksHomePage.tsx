import React, { useState } from 'react';
import { Container, Box, Typography, Fab, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ToastSeverityOptions } from '../budgeting-page/types/BudgetCategoryTypes';
import ToastMessage from '../customizations/ToastMessages';
import TaskForm from './components/TaskForm';
import UpcomingTaskList from './components/UpcomingTaskList';
import CalendarView from './components/CalendarView';
import en from '../i18n/en';

const TasksHomePage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] =
    useState<ToastSeverityOptions>('success');
  const [showToast, setShowToast] = useState(false);

  const handleToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
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
          <UpcomingTaskList refreshKey={refreshKey} onToast={handleToast} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CalendarView refreshKey={refreshKey} />
        </Grid>
      </Grid>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleRefresh}
        onToast={handleToast}
      />

      <Fab
        color="primary"
        aria-label={en.tasksPage.createTask}
        data-testid="create-task-fab"
        onClick={() => setFormOpen(true)}
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
