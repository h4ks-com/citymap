import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

import {City, CityHelper} from '../types';

interface CityOption extends City {
  displayName: string;
  country: string;
}

interface CitySelectionDialogProps {
  open: boolean;
  cities: CityOption[];
  onSelect: (city: City) => void;
  onCancel: () => void;
  searchTerm: string;
}

const CitySelectionDialog: React.FC<CitySelectionDialogProps> = ({
  open,
  cities,
  onSelect,
  onCancel,
  searchTerm,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedCityId(event.target.value);
  };

  const handleConfirm = () => {
    const selectedCity = cities.find(
      city => new CityHelper(city).id() === selectedCityId,
    );
    if (selectedCity) {
      onSelect(selectedCity);
    }
  };

  const handleCancel = () => {
    setSelectedCityId('');
    onCancel();
  };

  // Reset selection when dialog opens/closes
  React.useEffect(() => {
    if (open && cities.length > 0) {
      // Auto-select the first option
      setSelectedCityId(new CityHelper(cities[0]).id());
    } else {
      setSelectedCityId('');
    }
  }, [open, cities]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          zIndex: 5000,
        },
      }}
    >
      <DialogTitle>
        {cities.length === 1 ? 'Confirm City' : 'Select City'}
      </DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{mb: 2}}>
          {cities.length === 1
            ? `Confirm adding "${searchTerm}" to the map:`
            : `Multiple cities found for "${searchTerm}". Please select one:`}
        </Typography>
        <FormControl component='fieldset' fullWidth>
          <RadioGroup value={selectedCityId} onChange={handleSelectionChange}>
            {cities.map(city => {
              const cityId = new CityHelper(city).id();
              return (
                <FormControlLabel
                  key={cityId}
                  value={cityId}
                  control={<Radio />}
                  label={
                    <div>
                      <Typography variant='body1' component='div'>
                        {city.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        component='div'
                      >
                        {city.displayName}
                      </Typography>
                    </div>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    py: 1,
                    '& .MuiRadio-root': {
                      mt: 0.5,
                    },
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          disabled={!selectedCityId}
        >
          Add City
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CitySelectionDialog;
