import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import 'maplibre-gl/dist/maplibre-gl.css';
import React from 'react';

import './App.css';
import {AlertProvider} from './components/AlertContext';
import {useAlert} from './components/AlertContext';
import Main from './components/Main';
import {Storage, getStorageClass} from './storage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d81b60',
    },
    secondary: {
      main: '#f06292',
    },
  },
});

interface ErrorWrapperProps {
  attempt: number;
}

const ErrorWrapper: React.FC<ErrorWrapperProps> = ({attempt}) => {
  const {showAlert} = useAlert();
  if (attempt > 0) return null;

  // if query param cities is present, use it instead of local storage
  try {
    const StorageClass: typeof Storage = getStorageClass();
    return <Main StorageClass={StorageClass} />;
  } catch (error) {
    console.error(error);
    if (window.location.search.includes('cities')) {
      showAlert(
        'Something is wrong with the share URL.\nClick OK to refresh',
        'Error loading cities from URL',
        {
          callback: () => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          },
          triggerOnOpen: true,
        },
      );
    }
    return null;
  }
};

function App() {
  const [attempt, setAttempt] = React.useState(0);
  return (
    <ThemeProvider theme={darkTheme}>
      <AlertProvider
        onOpen={() => {
          setAttempt(attempt + 1);
        }}
      >
        <CssBaseline />
        <ErrorWrapper attempt={attempt} />
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
