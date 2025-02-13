import React from 'react';
import { Alert, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ToastSeverityOptions } from '../budgeting-page/types/BudgetCategoryTypes';

type ToastMessageProps = {
  message: string;
  severity: ToastSeverityOptions;
  onClose: () => void;
  duration?: number;
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  severity,
  onClose,
  duration = 3000,
}) => {
  return (
    <Snackbar
      open={true}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        id="toast-message"
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
