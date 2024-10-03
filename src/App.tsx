import 'maplibre-gl/dist/maplibre-gl.css';
import Sidebar from './components/Sidebar';
import {City} from './types';
import './App.css';
import useLocalStorage from './customHooks';
import FloatingArrowMenu from './components/MapFab';
import appLayers, {LayerType} from './layers';
import MapContainer from './components/Map';
import {batchFetchPopulateCityData, CityFields, cityFieldsFromLayers} from './apis';
import {useEffect} from 'react';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d81b60',
    },
    secondary: {
      main: '#f06292',
    },
  },
});

function App() {
  const [cities, setCities] = useLocalStorage<City[]>('cities', []);
  const [enabledLayers, setEnabledLayers] = useLocalStorage<LayerType[]>('layersOn', appLayers.filter(layer => layer.defaultToggled).map(layer => layer.type));

  const updateCityData = async (currentCities: City[]) => {
    const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
    const updatedCities = await batchFetchPopulateCityData(currentCities, cityFields);
    setCities([...updatedCities]);
  };

  const handleAddCity = (newCity: City) => {
    const newCities = [...cities, newCity];
    setCities(newCities);
    updateCityData(newCities);
  };

  const handleRemoveCity = (cityName: string) => {
    setCities((prevCities) => prevCities.filter(city => city.name !== cityName));
  };

  useEffect(() => {
    updateCityData(cities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledLayers]);

  // Update temperature every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      updateCityData(cities);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app">
        <FloatingArrowMenu layers={appLayers} enabledLayers={enabledLayers} onToggleEvent={(layers) => {
          setEnabledLayers(layers);
          updateCityData(cities);
        }} />
        <div className="sidebar-container">
          <Sidebar cities={cities} onAddCity={handleAddCity} onRemoveCity={handleRemoveCity} />
        </div>
        <div className="map-container">
          <MapContainer cities={cities} enabledLayers={enabledLayers} onAddCity={handleAddCity} />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
