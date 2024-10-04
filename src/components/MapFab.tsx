import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShareIcon from '@mui/icons-material/Share';
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {shareOnMobile} from 'react-mobile-share';

import appSources, {LayerType} from '../layers';
import {objectToQueryString} from '../storage';
import {City, FloatingMenuLayer} from '../types';

interface LayerMenuProps {
  sources: FloatingMenuLayer[];
  styles: FloatingMenuLayer[];
  enabledLayers: string[];
  onToggleEvent?: (enabledLayers: LayerType[]) => void;
  onSaveMap?: () => void;
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
  onSaveMap,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [flyLooping, setFlyLooping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [sourceSwitchStates, setSourceSwitchStates] = useState<{
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

  const [selectedStyle, setSelectedStyle] = useState<string>(
    styles.find(style => enabledLayers.includes(style.type))?.type || 'default',
  );

  const handleSourceSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
    setSourceSwitchStates(newSwitchState);

    const layers = {...newSwitchState, [selectedStyle]: true};
    const enabledLayers = Object.entries(layers)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
    onToggleLayer?.(enabledLayers as LayerType[]);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = event.target.value;
    setSelectedStyle(newStyle);

    const layers = {...sourceSwitchStates, [newStyle]: true};
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
    shareOnMobile({
      title: 'City Map',
      text: 'Share the current cities into a temporary map',
      url: generateShareableUrl(),
    });
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
        overflow: 'scroll',
        scrollBehavior: 'smooth',
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

      <Collapse
        in={open}
        orientation='vertical'
        sx={{
          mt: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.paper',
          }}
          style={{maxHeight: '70vh', overflow: 'scroll'}}
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
                }}
              >
                <Tooltip title={layer.description} arrow placement='left'>
                  <Box>
                    <Switch
                      checked={sourceSwitchStates[layer.type]}
                      onChange={handleSourceSwitchChange}
                      name={layer.name}
                      id={layer.type}
                    />
                    <Typography variant='caption' sx={{ml: 1}}>
                      {layer.name}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            ))}
          <Box sx={{height: 8}} />
          <RadioGroup
            name='styles'
            value={selectedStyle}
            onChange={handleStyleChange}
            sx={{ml: 2}}
          >
            {styles
              .filter(style => style.toggleable)
              .map(style => (
                <Box
                  key={style.name}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Tooltip title={style.description} arrow placement='left'>
                    <FormControlLabel
                      value={style.type}
                      control={<Radio />}
                      label={
                        <Typography variant='caption'>{style.name}</Typography>
                      }
                    />
                  </Tooltip>
                </Box>
              ))}
          </RadioGroup>

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
              placement='left'
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
            <Tooltip
              title='Get a shareable URL for a temporary app with the current cities'
              arrow
              placement='left'
            >
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
            </Tooltip>
          </CopyToClipboard>
          {/* Map Screenshot. Save map as an image */}
          <Tooltip
            title='Save the current map view as an image'
            arrow
            placement='left'
          >
            <Button
              variant='contained'
              color='primary'
              startIcon={<SaveAltIcon />}
              fullWidth
              onClick={onSaveMap}
              sx={{
                mt: 2,
                transition: 'background-color 0.3s ease',
              }}
            >
              Save View
            </Button>
          </Tooltip>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default FloatingArrowMenu;
