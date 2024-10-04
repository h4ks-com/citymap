import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, {ReactNode, createContext, useContext, useState} from 'react';

interface AlertOpts {
  callback?: () => void;
  triggerOnOpen?: boolean;
}

// Define the shape of the context
interface AlertContextProps {
  showAlert: (message: string, title?: string, opts?: AlertOpts) => void;
}

// Create the Alert Context
const AlertContext = createContext<AlertContextProps | undefined>(undefined);

// Custom hook to use Alert Context
export const useAlert = (): AlertContextProps => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// AlertProvider to wrap the app
export const AlertProvider: React.FC<{
  children: ReactNode;
  onOpen: () => void;
}> = ({children, onOpen}) => {
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [opts, setOpts] = useState<AlertOpts>({});

  const showAlert = (
    message: string,
    title: string = 'Sorry 🙁',
    opts?: AlertOpts,
  ) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setOpts(opts || {});
    setOpen(true);
    if (opts?.triggerOnOpen) {
      onOpen();
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      handleClose();
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const handleClose = () => {
    setOpen(false);
    opts?.callback?.();
  };

  return (
    <AlertContext.Provider value={{showAlert}}>
      {children}

      <Dialog
        open={open}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        sx={{
          '& .MuiDialog-paper': {
            top: '-20%', // Adjust the top positioning
            transform: 'translateY(0)', // Prevents it from being centered
            margin: 0,
          },
        }}
      >
        <DialogTitle>{alertTitle}</DialogTitle>
        <DialogContent>
          <Typography>{alertMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='contained' color='primary'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </AlertContext.Provider>
  );
};
