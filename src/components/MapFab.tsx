import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ShareIcon from '@mui/icons-material/Share';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import {LayerType} from '../layers';
import {objectToQueryString} from '../storage';
import {City, FloatingMenuLayer} from '../types';

interface LayerMenuProps {
  layers: FloatingMenuLayer[];
  enabledLayers: string[];
  onToggleEvent?: (enabledLayers: LayerType[]) => void;
  onFlyLoop?: (flyLooping: boolean) => void;
  cities: City[];
}

const FloatingArrowMenu: React.FC<LayerMenuProps> = ({
  layers,
  enabledLayers,
  onToggleEvent: onToggleLayer,
  onFlyLoop,
  cities,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [flyLooping, setFlyLooping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [switchStates, setSwitchStates] = useState<{[key: string]: boolean}>(
    layers.reduce(
      (acc, layer) => {
        acc[layer.type] = enabledLayers.includes(layer.type);
        return acc;
      },
      {} as {[key: string]: boolean},
    ),
  );

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSwitchState = {
      ...switchStates,
      [event.target.id]: event.target.checked,
    };
    setSwitchStates(newSwitchState);

    const enabledLayers = Object.entries(newSwitchState)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
    onToggleLayer?.(enabledLayers as LayerType[]);
  };

  const generateShareableUrl = () => {
    const currentUrl = window.location.href.split('?')[0];
    return `${currentUrl}?cities=${objectToQueryString(cities)}`;
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          transition: 'top 0.3s ease',
        }}
      >
        {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </IconButton>

      <Collapse in={open} orientation='vertical' sx={{mt: 1}}>
        <Paper
          elevation={3}
          sx={{
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.paper',
          }}
        >
          {layers
            .filter(layer => layer.toggleable)
            .map(layer => (
              <Box
                key={layer.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Tooltip title={layer.description} arrow>
                  <Switch
                    checked={switchStates[layer.type]}
                    onChange={handleSwitchChange}
                    name={layer.name}
                    id={layer.type}
                  />
                </Tooltip>
                <Typography variant='caption' sx={{ml: 1}}>
                  {layer.name}
                </Typography>
              </Box>
            ))}
          <Box
            key='loop'
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Tooltip
              title="Fly over all the cities in the sidebar's order"
              arrow
              sx={{mt: 3}}
            >
              <Button
                variant='contained'
                fullWidth
                onClick={() => {
                  if (flyLooping) return;
                  setFlyLooping(!flyLooping);
                  onFlyLoop?.(!flyLooping);
                }}
                disabled={cities.length < 2}
              >
                Fly Loop
              </Button>
            </Tooltip>
          </Box>

          {/* Share Button with Copy Feedback */}
          <CopyToClipboard text={generateShareableUrl()} onCopy={handleCopy}>
            <Button
              variant='contained'
              color={copied ? 'success' : 'primary'}
              startIcon={<ShareIcon />}
              fullWidth
              sx={{
                mt: 2,
                transition: 'background-color 0.3s ease',
              }}
            >
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </CopyToClipboard>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default FloatingArrowMenu;
