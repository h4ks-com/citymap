import React from 'react';
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
  subtext: string;
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
      subtext: cityFields.has('timezone') ? helper.formatedCurrentTime() : '',
      temperature: cityFields.has('temperature') ? city.temperature : undefined,
    }
  };
}

interface MapComponentProps {
  cities: City[];
  enabledLayers: LayerType[];
}

const MapContainer: React.FC<MapComponentProps> = ({cities, enabledLayers}) => {
  const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
  const createGeoJSONData = (cities: City[], cityFields: Set<CityFields>): FeatureCollection<Point, LayerProperties> => {
    return {
      type: 'FeatureCollection',
      features: cities.map(city => createPointFeatureFromCity(city, cityFields)),
    };
  }
  let geojson = createGeoJSONData(cities, cityFields)
  const layers = appLayers.filter(layer => enabledLayers.includes(layer.type));

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
