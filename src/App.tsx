import 'maplibre-gl/dist/maplibre-gl.css';
import Sidebar from './Sidebar';
import {City} from './types';
import './App.css';
import useLocalStorage from './customHooks';
import FloatingArrowMenu from './layersMenu';
import appLayers, {LayerType} from './layers';
import MapContainer from './Map';
import {batchFetchPopulateCityData, CityFields, cityFieldsFromLayers} from './apis';
import {useEffect} from 'react';

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
    <div className="app">
      <FloatingArrowMenu layers={appLayers} enabledLayers={enabledLayers} onToggleEvent={(layers) => {
        setEnabledLayers(layers);
        updateCityData(cities);
      }} />
      <div className="sidebar-container">
        <Sidebar cities={cities} onAddCity={handleAddCity} onRemoveCity={handleRemoveCity} />
      </div>

      <div className="map-container">
        <MapContainer cities={cities} enabledLayers={enabledLayers} />
      </div>
    </div>
  );
}

export default App;
