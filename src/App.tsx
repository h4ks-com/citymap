import React from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import type {FeatureCollection} from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import Sidebar from './Sidebar';
import {City} from './types';
import './App.css';
import {Point, Feature, GeoJsonProperties} from 'geojson';
import useLocalStorage from './customHooks';
import FloatingArrowMenu from './layersMenu';
import layers from './layers';


function createPointFeature(city: City): Feature<Point, GeoJsonProperties> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [city.lon, city.lat],
    },
    properties: {
      name: city.name,
    },
  };
}


interface MapComponentProps {
  cities: City[];
}

const MapContainer: React.FC<MapComponentProps> = ({cities}) => {
  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: []
  };

  cities.forEach(city => {
    geojson.features.push(createPointFeature(city));
  });

  return (
    <Map
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      mapStyle={`${process.env.PUBLIC_URL}/style.json`}
      style={{width: "80vw", height: "100vh"}}
    >
      {layers.map(layer => {
        return <Source id={layer.type} type="geojson" data={geojson}>
          <Layer {...layer.spec} />
        </Source>
      })}
    </Map>
  );
}

function App() {
  const [cities, setCities] = useLocalStorage<City[]>('cities', []);

  const handleAddCity = (newCity: City) => {
    setCities((prevCities) => [...prevCities, newCity]);
  };

  const handleRemoveCity = (cityName: string) => {
    setCities((prevCities) => prevCities.filter(city => city.name !== cityName));
  };
  return (
    <div className="app">
      <FloatingArrowMenu layers={layers} />
      <div className="sidebar-container">
        <Sidebar cities={cities} onAddCity={handleAddCity} onRemoveCity={handleRemoveCity} />
      </div>

      <div className="map-container">
        <MapContainer cities={cities} />
      </div>
    </div>
  );
}

export default App;
