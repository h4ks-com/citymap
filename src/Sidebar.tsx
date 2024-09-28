// src/components/Sidebar.tsx
import React, {useState} from 'react';
import axios from 'axios';
import {City} from './types';

interface SidebarProps {
  cities: City[];
  onAddCity: (city: City) => void;
  onRemoveCity: (cityName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({cities, onAddCity, onRemoveCity}) => {
  const [cityInput, setCityInput] = useState('');

  const handleAddCity = async () => {
    if (!cityInput) return;

    try {
      // Use Nominatim API for geocoding the city
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: cityInput,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data.length > 0) {
        const cityData = response.data[0];
        const newCity: City = {
          name: cityData.display_name.split(',')[0],
          lat: parseFloat(cityData.lat),
          lon: parseFloat(cityData.lon),
        };
        setCityInput('');
        onAddCity(newCity);
      } else {
        alert('City not found!');
      }

    } catch (error) {
      console.error('Error fetching city data', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleAddCity()
    }
  }

  return (
    <div className="sidebar">
      <h2>Cities</h2>
      <p>Add a city to the map:</p>
      <input
        type="text"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter city name"
      />
      <button onClick={handleAddCity}>Add City</button>
      <ul>
        {cities.map((city, index) => (
          <li key={index}>
            {city.name}
            <button onClick={() => onRemoveCity(city.name)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
