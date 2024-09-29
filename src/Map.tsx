import React, {useState} from 'react';
import Map, {Source, Layer} from 'react-map-gl/maplibre';
import type {FeatureCollection} from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import {City} from './types';
import './App.css';
import {Point, Feature} from 'geojson';
import appLayers, {LayerType} from './layers';
import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import moment from 'moment';


function getCityID(city: City): string {
  // Returns hash of city coordinates and name
  return sha256(`${city.lat}${city.lon}${city.name}`).toString();
}

async function getTemperature(city: City): Promise<City> {
  // Fetch weather data from OpenWeather API
  try {
    // Get current temperature from Open-Meteo API
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: city.lat,
        longitude: city.lon,
        current_weather: true,
      },
    });
    city.temperature = weatherResponse.data.current_weather.temperature;
    return city;

  } catch (error) {
    console.error('Error fetching temperature:', error);
    throw error;
  }
}

async function getCurrentTime(city: City): Promise<City> {
  // Get local time from WorldTimeAPI
  try {
    const timeResponse = await axios.get(`http://worldtimeapi.org/api/timezone/Etc/GMT`, {
      params: {
        lat: city.lat,
        lon: city.lon,
      },
    });
    city.time = new Date(timeResponse.data.unixtime * 1000);
    return city;
  } catch (error) {
    console.error('Error fetching time:', error);
    throw error;
  }
}

interface LayerProperties {
  name: string;
  subtext: string;
}

function createPointFeature(city: City, enabledLayers: LayerType[], setGeoJSONData: (city: City, prop: LayerProperties) => void): Feature<Point, LayerProperties> {
  let requestsArray: Promise<any>[] = [];

  if (enabledLayers.includes('time')) {
    requestsArray.push(getCurrentTime(city));
  }
  if (enabledLayers.includes('temperature')) {
    requestsArray.push(getTemperature(city));
  }
  Promise.all(requestsArray).then((results: City[]) => {
    for (const city of results) {
      let subtext = '';
      if (city.time) {
        // Only time HH:MM is needed
        subtext = moment(city.time).format('HH:mm');
      }
      if (city.temperature) {
        subtext += ` ${city.temperature}C`;
      }
      setGeoJSONData(city, {name: city.name, subtext});
    }
  }).catch((error) => {
    console.error('Error fetching data:', error);
  });

  return {
    type: 'Feature',
    id: getCityID(city),
    geometry: {
      type: 'Point',
      coordinates: [city.lon, city.lat],
    },
    properties: {
      name: city.name,
      subtext: '',
    }
  };
}

interface MapComponentProps {
  cities: City[];
  enabledLayers: LayerType[];
}

const MapContainer: React.FC<MapComponentProps> = ({cities, enabledLayers}) => {
  const geojson: FeatureCollection<Point, LayerProperties> = {
    type: 'FeatureCollection',
    features: []
  };

  const [geoJSONData, setGeoJSONData] = useState(geojson);

  cities.forEach(city => {
    geojson.features.push(createPointFeature(city, enabledLayers, (city, prop) => {
      setGeoJSONData((prevData) => {
        for (let i = 0; i < prevData.features.length; i++) {
          if (prevData.features[i].id === getCityID(city)) {
            prevData.features[i].properties = {...prop};
            return {...prevData};
          }
        }
        return prevData;
      });
    }));
  });

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
        return <Source id={layer.type} type="geojson" data={geoJSONData} key={layer.type}>
          <Layer {...layer.spec} />
        </Source>
      })}
    </Map>
  );
}

export default MapContainer;
