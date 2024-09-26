import React, {useState} from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import type {SymbolLayer, CircleLayer} from 'react-map-gl/maplibre';
import type {FeatureCollection} from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import Sidebar from './Sidebar';
import {City} from './types';
import './App.css';
import {Point, Feature, GeoJsonProperties} from 'geojson';

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


const layerStyle: SymbolLayer = {
  id: 'labels',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-field': ['get', 'name'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 25,
  },
  paint: {
    'text-color': '#000000',
    'text-halo-color': '#ffffff',
    'text-halo-width': 4,
  }
};

const pointsStyle: CircleLayer = {
  id: 'point',
  type: 'circle',
  source: 'circle',
  paint: {
    'circle-radius': 12,
    'circle-color': '#cc1236dd'
  }
};



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
      style={{width: "100vw", height: "100vh"}}
    >
      <Source id="labels" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
      <Source id="circle" type="geojson" data={geojson}>
        <Layer {...pointsStyle} />
      </Source>
    </Map>
  );
}

function App() {
  const [cities, setCities] = useState<City[]>([]);

  const handleAddCity = (newCity: City) => {
    setCities((prevCities) => [...prevCities, newCity]);
  };

  const handleRemoveCity = (cityName: string) => {
    setCities((prevCities) => prevCities.filter(city => city.name !== cityName));
  };
  return (
    <div className="app">
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
