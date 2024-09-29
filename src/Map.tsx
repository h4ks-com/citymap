import React, {useEffect, useState} from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import type {FeatureCollection} from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import {City, CityHelper} from './types';
import './App.css';
import {Point, Feature} from 'geojson';
import appLayers, {LayerType} from './layers';
import {CityFields, cityFieldsFromLayers} from './apis';

interface LayerProperties {
  name: string;
  time: string;
  temperature: number | undefined;
}

function createPointFeatureFromCity(city: City, cityFields: Set<CityFields>): Feature<Point, LayerProperties> {
  const helper = new CityHelper(city);
  return {
    type: 'Feature',
    id: helper.id(),
    geometry: {
      type: 'Point',
      coordinates: [city.lon, city.lat],
    },
    properties: {
      name: city.name,
      time: cityFields.has('timezone') ? helper.formatedCurrentTime() : '',
      temperature: cityFields.has('temperature') ? city.temperature : undefined,
    }
  };
}

const createGeoJSONData = (cities: City[], cityFields: Set<CityFields>): FeatureCollection<Point, LayerProperties> => {
  return {
    type: 'FeatureCollection',
    features: cities.map(city => createPointFeatureFromCity(city, cityFields)),
  };
}

interface MapComponentProps {
  cities: City[];
  enabledLayers: LayerType[];
}

const MapContainer: React.FC<MapComponentProps> = ({cities, enabledLayers}) => {
  const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
  const [geojson, setGeojson] = useState(createGeoJSONData([], cityFields));
  const layers = appLayers.filter(layer => enabledLayers.includes(layer.type));

  useEffect(() => {
    setGeojson(createGeoJSONData(cities, cityFields));
  }, [cities, enabledLayers]);

  // If time is shown, update every time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cityFields.has('timezone')) {
      timer = setInterval(() => {
        setGeojson(createGeoJSONData(cities, cityFields));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cities, cityFields]);


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
        return <Source id={layer.type} type="geojson" data={geojson} key={layer.type}>
          <Layer {...layer.spec} />
        </Source>
      })}
    </Map>
  );
}

export default MapContainer;
