import React, {useState} from 'react';
import {City} from './types';
import {geocodeCity} from './apis';

interface SidebarProps {
  cities: City[];
  onAddCity: (city: City) => void;
  onRemoveCity: (cityName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({cities, onAddCity, onRemoveCity}) => {
  const [cityInput, setCityInput] = useState('');

  const handleAddCity = async () => {
    if (!cityInput) return;
    const newCity = await geocodeCity(cityInput);
    if (newCity) {
      setCityInput('');
      onAddCity(newCity);
    } else {
      alert('City not found!');
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
