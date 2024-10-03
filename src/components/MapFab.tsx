import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import React, {useState} from 'react'

import {LayerType} from '../layers'
import {City, FloatingMenuLayer} from '../types'

// Example layers array
interface LayerMenuProps {
  layers: FloatingMenuLayer[]
  enabledLayers: string[]
  onToggleEvent?: (enabledLayers: LayerType[]) => void
  onFlyLoop?: (flyLooping: boolean) => void
  cities: City[]
}

const FloatingArrowMenu: React.FC<LayerMenuProps> = ({
  layers,
  enabledLayers,
  onToggleEvent: onToggleLayer,
  onFlyLoop,
  cities,
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [flyLooping, setFlyLooping] = useState<boolean>(false)

  // Initialize state with all switches
  const [switchStates, setSwitchStates] = useState<{[key: string]: boolean}>(
    layers.reduce(
      (acc, layer) => {
        acc[layer.type] = enabledLayers.includes(layer.type)
        return acc
      },
      {} as {[key: string]: boolean},
    ),
  )

  // Handle switch changes
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSwitchState = {
      ...switchStates,
      [event.target.id]: event.target.checked,
    }
    setSwitchStates(newSwitchState)

    // Update enabled layers, prevent duplicates
    const enabledLayers = Object.entries(newSwitchState)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
    onToggleLayer?.(enabledLayers as LayerType[])
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: '16px',
        display: 'flex',
        flexDirection: 'column', // Align button and dropdown vertically
        alignItems: 'center',
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
          transition: 'top 0.3s ease',
        }}
      >
        {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </IconButton>

      {/* Dropdown Menu */}
      <Collapse in={open} orientation='vertical' sx={{mt: 1}}>
        <Paper
          elevation={3}
          sx={{
            padding: '8px',
            display: 'flex',
            flexDirection: 'column', // Arrange switches vertically
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
              title="Fly over all the cities in the sideba's order"
              arrow
              sx={{mt: 3}}
            >
              <Button
                variant='contained'
                fullWidth
                onClick={() => {
                  if (flyLooping) return
                  setFlyLooping(!flyLooping)
                  onFlyLoop?.(!flyLooping)
                }}
                disabled={cities.length < 2}
              >
                Fly Loop
              </Button>
            </Tooltip>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  )
}

export default FloatingArrowMenu
