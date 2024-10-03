import React, {useState} from 'react';
import {CityManagerProps} from '../types';
import {geocodeCityName} from '../apis';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  InputAdornment,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

const Sidebar: React.FC<CityManagerProps> = ({cities, onAddCity, onRemoveCity}) => {
  const [cityInput, setCityInput] = useState('');

  const handleAddCity = async () => {
    if (!cityInput) return;
    const newCity = await geocodeCityName(cityInput);
    if (newCity) {
      setCityInput('');
      onAddCity?.(newCity);
    } else {
      alert('City not found!');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddCity();
    }
  };

  const isSearching = () => cityInput.length >= 3;
  const displayCities = cities.filter((city) =>
    isSearching() ? city.name.toLowerCase().trim().includes(cityInput.toLowerCase().trim()) : true
  );

  const highlightText = (text: string, highlight: string) => {
    if (!isSearching()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Typography
              key={index}
              component="span"
              sx={{fontWeight: 'bold', color: '#f06292'}}
            >
              {part}
            </Typography>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Cities
      </Typography>
      <Typography variant="body1">Add a city to the map:</Typography>

      {/* City Input Field */}
      <TextField
        label="Enter city name"
        variant="outlined"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        autoFocus
        slotProps={{
          input: {
            endAdornment: cityInput && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setCityInput('')}
                  edge="end"
                  aria-label="clear input"
                  sx={{color: 'red'}}
                  tabIndex={-1}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Add City Button */}
      <Button variant="contained" onClick={handleAddCity} fullWidth>
        Add City
      </Button>

      {/* City List */}
      <List sx={{flexGrow: 1, overflow: 'scroll'}}>
        {isSearching() && (
          <ListItem key="searching" sx={{cursor: 'default', color: 'text.disabled'}}>
            {displayCities.length === 0 ? (
              <ListItemText primary={`No results for "${cityInput}"`} />
            ) : (
              <ListItemText primary={`Searching for "${cityInput}"...`} />
            )}
          </ListItem>
        )}
        {displayCities.map((city, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onRemoveCity?.(city.name)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box>
                  {highlightText(city.name, cityInput)}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
