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

import appSources, {LayerType, appMapStyles} from '../layers';
import {objectToQueryString} from '../storage';
import {City, FloatingMenuLayer} from '../types';

interface LayerMenuProps {
  sources: FloatingMenuLayer[];
  styles: FloatingMenuLayer[];
  enabledLayers: string[];
  onToggleEvent?: (enabledLayers: LayerType[]) => void;
  onFlyLoop?: (flyLooping: boolean) => void;
  cities: City[];
}

const FloatingArrowMenu: React.FC<LayerMenuProps> = ({
  sources,
  styles,
  enabledLayers,
  onToggleEvent: onToggleLayer,
  onFlyLoop,
  cities,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [flyLooping, setFlyLooping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [sourceSwitchStates, setSourcecSwitchStates] = useState<{
    [key: string]: boolean;
  }>(
    sources.reduce(
      (acc, layer) => {
        if (
          appSources.filter(source => source.type === layer.type).length === 0
        )
          return acc;
        acc[layer.type] = enabledLayers.includes(layer.type);
        return acc;
      },
      {} as {[key: string]: boolean},
    ),
  );

  // styles are similar to layers but only one can be active at a time
  const [styleSwitchStates, setStyleSwitchStates] = useState<{
    [key: string]: boolean;
  }>(
    styles.reduce(
      (acc, style) => {
        if (
          appMapStyles.filter(source => source.type === style.type).length === 0
        )
          return acc;
        acc[style.type] = enabledLayers.includes(style.type);
        return acc;
      },
      {} as {[key: string]: boolean},
    ),
  );

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSwitchState = {
      ...sourceSwitchStates,
      [event.target.id]: event.target.checked,
    };
    // Only keep appSources
    for (const key in newSwitchState) {
      if (appSources.filter(source => source.type === key).length === 0) {
        delete newSwitchState[key];
      }
    }
    setSourcecSwitchStates(newSwitchState);

    const layers = {...styleSwitchStates, ...newSwitchState};
    const enabledLayers = Object.entries(layers)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
    onToggleLayer?.(enabledLayers as LayerType[]);
  };

  const handleStyleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Only one style can be active at a time
    let newSwitchState = {
      [event.target.id]: event.target.checked,
    };
    // If default is being disabled, we activate the second style
    if (event.target.id === 'default' && !event.target.checked) {
      newSwitchState = {
        satellite: true,
      };
    }
    console.log(newSwitchState);
    // If no style is active, we activate the default one
    if (Object.values(newSwitchState).every(value => !value)) {
      newSwitchState = {
        default: true,
      };
    }
    // Only keep appMapStyles
    for (const key in newSwitchState) {
      if (appMapStyles.filter(source => source.type === key).length === 0) {
        delete newSwitchState[key];
      }
    }
    setStyleSwitchStates(newSwitchState);

    const layers = {...sourceSwitchStates, ...newSwitchState};
    const enabledLayers = Object.entries(layers)
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
          {sources
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
                    checked={sourceSwitchStates[layer.type]}
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
          <Box sx={{height: 8}} />
          {styles
            .filter(style => style.toggleable)
            .map(style => (
              <Box
                key={style.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Tooltip title={style.description} arrow>
                  <Switch
                    checked={styleSwitchStates[style.type]}
                    onChange={handleStyleSwitchChange}
                    name={style.name}
                    id={style.type}
                  />
                </Tooltip>
                <Typography variant='caption' sx={{ml: 1}}>
                  {style.name}
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
