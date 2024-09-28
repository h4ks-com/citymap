import React, {useState} from 'react';
import {IconButton, Box, Switch, Collapse, Typography, Paper, Tooltip} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {LayerType} from './layers';

// Example layers array
export interface FloatingMenuLayer {
  type: string;
  name: string;
  description: string;
  defaultToggled: boolean;
  toggleable: boolean;
}

interface LayerMenuProps {
  layers: FloatingMenuLayer[];
  enabledLayers: string[];
  onToggleEvent?: (enabledLayers: LayerType[]) => void;
}

const FloatingArrowMenu: React.FC<LayerMenuProps> = ({layers, enabledLayers, onToggleEvent: onToggleLayer}) => {
  const [open, setOpen] = useState<boolean>(false);

  // Initialize state with all switches
  const [switchStates, setSwitchStates] = useState<{[key: string]: boolean}>(
    layers.reduce((acc, layer) => {
      acc[layer.type] = enabledLayers.includes(layer.type);
      return acc;
    }, {} as {[key: string]: boolean})
  );

  // Handle switch changes
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSwitchState = {
      ...switchStates,
      [event.target.id]: event.target.checked,
    };
    setSwitchStates(newSwitchState);

    // Update enabled layers, prevent duplicates
    const enabledLayers = Object.entries(newSwitchState)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
    onToggleLayer?.(enabledLayers as LayerType[]);
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
          {layers.filter((layer) => layer.toggleable).map((layer) => (
            <Box
              key={layer.name}
              sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2}}
            >
              <Tooltip title={layer.description} arrow>
                <Switch
                  checked={switchStates[layer.type]}
                  onChange={handleSwitchChange}
                  name={layer.name}
                  id={layer.type}
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
