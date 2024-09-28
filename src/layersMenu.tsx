import React, {useState} from 'react';
import {IconButton, Box, Switch, Collapse, Typography, Paper, Tooltip} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Example layers array
export interface FloatingMenuLayer {
  type: string;
  name: string;
  description: string;
}

interface LayerMenuProps {
  layers: FloatingMenuLayer[];
  onToggleLayer?: (layerName: string, visible: boolean) => void;
}

const FloatingArrowMenu: React.FC<LayerMenuProps> = ({layers, onToggleLayer}) => {
  const [open, setOpen] = useState<boolean>(false);

  // Initialize state with all switches set to false
  const [switchStates, setSwitchStates] = useState<{[key: string]: boolean}>(
    layers.reduce((acc, layer) => {
      acc[layer.name] = false;
      return acc;
    }, {} as {[key: string]: boolean})
  );

  // Handle switch changes
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchStates({
      ...switchStates,
      [event.target.name]: event.target.checked,
    });
    onToggleLayer?.(event.target.name, event.target.checked);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: open ? '16px' : '16px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      {/* Arrow Button */}
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          transition: 'right 0.3s ease',
        }}
      >
        {open ? <ArrowForwardIcon /> : <ArrowBackIcon />}
      </IconButton>

      {/* Dropdown Menu */}
      <Collapse in={open} orientation="horizontal" sx={{ml: 1}}>
        <Paper
          elevation={3}
          sx={{
            padding: '8px',
            display: 'flex',
            flexDirection: 'row', // Arrange switches horizontally
            backgroundColor: 'background.paper',
          }}
        >
          {layers.map((layer) => (
            <Box
              key={layer.name}
              sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2}}
            >
              <Tooltip title={layer.description} arrow>
                <Switch
                  checked={switchStates[layer.name]}
                  onChange={handleSwitchChange}
                  name={layer.name}
                />
              </Tooltip>
              <Typography variant="caption">{layer.name}</Typography>
            </Box>
          ))}
        </Paper>
      </Collapse>
    </Box>
  );
};

export default FloatingArrowMenu;
