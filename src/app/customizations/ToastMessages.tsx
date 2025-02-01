import React from 'react';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type ToastMessageProps = {
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  severity,
  onClose,
}) => {
  return (
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
  );
};

export default ToastMessage;
