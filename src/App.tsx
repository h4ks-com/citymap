import 'maplibre-gl/dist/maplibre-gl.css';
import Sidebar from './Sidebar';
import {City} from './types';
import './App.css';
import useLocalStorage from './customHooks';
import FloatingArrowMenu from './layersMenu';
import appLayers, {LayerType} from './layers';
import MapContainer from './Map';
import {useEffect} from 'react';
import {batchFetchPopulateCityData, CityFields, cityFieldsFromLayers} from './apis';

function App() {
  const [cities, setCities] = useLocalStorage<City[]>('cities', []);
  const [enabledLayers, setEnabledLayers] = useLocalStorage<LayerType[]>('layersOn', appLayers.filter(layer => layer.defaultToggled).map(layer => layer.type));

  const handleAddCity = (newCity: City) => {
    setCities((prevCities) => [...prevCities, newCity]);
  };

  const handleRemoveCity = (cityName: string) => {
    setCities((prevCities) => prevCities.filter(city => city.name !== cityName));
  };

  useEffect(() => {
    const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
    batchFetchPopulateCityData(cities, cityFields, (_: CityFields, updatedCities: City[]) => {
      setCities(updatedCities);
    });
  }, [enabledLayers, cities, setCities]);


  return (
    <div className="app">
      <FloatingArrowMenu layers={appLayers} enabledLayers={enabledLayers} onToggleEvent={(layers) => setEnabledLayers(layers)} />
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
