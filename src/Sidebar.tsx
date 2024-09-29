import React, {useState} from 'react';
import {CityManagerProps} from './types';
import {geocodeCityName} from './apis';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
      />

      {/* Add City Button */}
      <Button variant="contained" onClick={handleAddCity} fullWidth>
        Add City
      </Button>

      {/* City List */}
      <List>
        {cities.map((city, index) => (
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
            <ListItemText primary={city.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
