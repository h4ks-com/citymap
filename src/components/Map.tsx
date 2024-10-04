import type {FeatureCollection} from 'geojson';
import {Feature, Point} from 'geojson';
import {MapLibreEvent} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, {useEffect, useRef, useState} from 'react';
import Map, {Layer, Source} from 'react-map-gl/maplibre';

import {CityFields, cityFieldsFromLayers, reverseGeocodeCity} from '../apis';
import appSources, {LayerType, appMapStyles} from '../layers';
import {City, CityHelper, CityManagerProps} from '../types';
import {useAlert} from './AlertContext';

interface LayerProperties {
  identifier: string;
  name: string;
  time: string;
  temperature: number | undefined;
}

function createPointFeatureFromCity(
  city: City,
  cityFields: Set<CityFields>,
): Feature<Point, LayerProperties> {
  const helper = new CityHelper(city);
  const id = helper.id();
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [city.lon, city.lat],
    },
    properties: {
      identifier: id,
      name: city.name,
      time: cityFields.has('timezone') ? helper.formatedCurrentTime() : '',
      temperature: cityFields.has('temperature') ? city.temperature : undefined,
    },
    id: id,
  };
}

const createGeoJSONData = (
  cities: City[],
  cityFields: Set<CityFields>,
): FeatureCollection<Point, LayerProperties> => {
  return {
    type: 'FeatureCollection',
    features: cities.map(city => createPointFeatureFromCity(city, cityFields)),
  };
};

interface MapComponentProps extends CityManagerProps {
  enabledLayers: LayerType[];
  onMapLoad?: (map: maplibregl.Map) => void;
  hide?: boolean;
  fullWidth?: boolean;
}

const MapContainer: React.FC<MapComponentProps> = ({
  cities,
  enabledLayers,
  onAddCity,
  onCityClick,
  onMapLoad,
  hide,
  fullWidth,
}) => {
  const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
  const [geojson, setGeojson] = useState(createGeoJSONData([], cityFields));
  const {showAlert} = useAlert();
  const map = useRef<maplibregl.Map>();

  useEffect(() => {
    setGeojson(createGeoJSONData(cities, cityFields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, enabledLayers]);

  // If time is shown, update every time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cityFields.has('timezone')) {
      timer = setInterval(() => {
        setGeojson(createGeoJSONData(cities, cityFields));
      }, 10000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, cityFields]);

  return (
    <Map
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      style={{
        display: hide ? 'none' : 'block',
        ...(fullWidth ? {width: '100%', position: 'fixed'} : {}),
      }}
      onLoad={(e: MapLibreEvent) => {
        if (!e.target) return;
        map.current = e.target as unknown as maplibregl.Map;
        onMapLoad?.(map.current);
      }}
      mapStyle={
        appMapStyles
          .filter(style => enabledLayers.includes(style.type))
          .concat(appMapStyles)[0].style
      }
      onContextMenu={async event => {
        event.preventDefault();
        const {lng, lat} = event.lngLat;
        const city = await reverseGeocodeCity(lat, lng);
        if (!city) {
          showAlert('Could not find city at this location');
          return;
        }
        onAddCity?.(city);
      }}
      onClick={event => {
        const features = event.features;
        if (!features?.length) return;
        const city = cities.find(
          city => new CityHelper(city).id() === features[0].id,
        );
        if (city) {
          onCityClick?.(city);
        }
      }}
      onMouseMove={event => {
        const features = event.features;
        if (!features?.length) return;
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        for (const feature of features) {
          map.current?.setFeatureState(
            {id: feature.id, source: 'dots'},
            {hover: true},
          );
        }
      }}
      onMouseLeave={event => {
        const features = event.features;
        if (!features?.length) return;
        if (map.current) map.current.getCanvas().style.cursor = 'grab';
        for (const feature of features) {
          map.current?.setFeatureState(
            {id: feature.id, source: 'dots'},
            {hover: false},
          );
        }
      }}
      interactiveLayerIds={['point']}
      preserveDrawingBuffer
    >
      {appSources
        .filter(layer => enabledLayers.includes(layer.type))
        .map(layer => {
          return (
            <Source
              id={layer.type}
              type='geojson'
              data={geojson}
              key={layer.type}
              promoteId='identifier'
            >
              <Layer {...layer.spec} />
            </Source>
          );
        })}
    </Map>
  );
};

export default MapContainer;
