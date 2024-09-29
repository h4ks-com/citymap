import axios from 'axios';
import {City} from './types';

async function requestWithRetry<T>(request: () => Promise<T>, retries = 3): Promise<T> {
  // Retry the request up to 3 times if it fails waiting a bit between each retry
  try {
    return await request();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    return new Promise((resolve, _) => {
      setTimeout(() => {
        resolve(requestWithRetry(request, retries - 1));
      }, 1000);
    });
  }
}

async function getTimezone(city: City): Promise<string> {
  // Get local time from WorldTimeAPI
  try {
    const timeResponse = await axios.get(`https://geo2tz.h4ks.com/tz/${city.lat}/${city.lon}`);
    return timeResponse.data.tz;
  } catch (error) {
    console.error('Error fetching time:', error);
    throw error;
  }
}

async function getTemperature(city: City): Promise<number> {
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
    return weatherResponse.data.current_weather.temperature;
  } catch (error) {
    console.error('Error fetching temperature:', error);
    throw error;
  }
}

type BatchMap = {
  timezone: Promise<void>[],
  temperature: Promise<void>[],
}

export type CityFields = keyof City;

export function cityFieldsFromLayers(enabledLayers: string[]): Set<CityFields> {
  // Convert enabled layers to city fields
  const cityFields: Set<CityFields> = new Set();
  if (enabledLayers.includes('temperature')) {
    cityFields.add('temperature');
  }
  if (enabledLayers.includes('time')) {
    cityFields.add('timezone');
  }
  return cityFields;
}

export async function batchFetchPopulateCityData(
  cities: City[],
  fields: Set<CityFields>,
): Promise<City[]> {
  // Fetch timezone and temperature for every city and calls onFinish when done with each field idependently in background
  if (!fields.size || !cities.length) return cities;

  // Store all promises in a ojbect of promise arrays
  const cityDataPromises: BatchMap = {timezone: [], temperature: []};

  cities.forEach(city => {
    // We don't need to fetch timezone again
    if (fields.has("timezone") && !city.timezone) {
      cityDataPromises.timezone.push(getTimezone(city).then(timezone => {
        city.timezone = timezone;
      }));
    }
    // Always fetch latest temperature
    if (fields.has("temperature")) {
      cityDataPromises.temperature.push(getTemperature(city).then(temperature => {
        city.temperature = temperature;
      }));
    }
  });

  // Wait for all promises to resolve
  await Promise.all(cityDataPromises.timezone.concat(cityDataPromises.temperature).map(promise => requestWithRetry(() => promise)));
  return cities;
}

export async function geocodeCityName(cityInput: string): Promise<City | null> {
  try {
    // Use Nominatim API for geocoding the city
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: cityInput,
        format: 'json',
        limit: 1,
      },
    });

    if (response.data.length === 0) {
      return null;
    }
    const cityData = response.data[0];
    return {
      name: cityData.display_name.split(',')[0],
      lat: parseFloat(cityData.lat),
      lon: parseFloat(cityData.lon),
    };
  } catch (error) {
    console.error('Error fetching city data', error);
    throw error;
  }
}

export async function reverseGeocodeCity(lat: number, lon: number): Promise<City | null> {
  try {
    // Use Nominatim API for reverse geocoding the city
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon,
        format: 'json',
        zoom: 10,
      },
    });
    console.debug(response.data);

    if (!response.data.display_name) {
      return null;
    }

    return {
      name: response.data.display_name.split(',')[0],
      lat: response.data.lat,
      lon: response.data.lon,
    };
  } catch (error) {
    console.error('Error fetching city data', error);
    throw error;
  }
}
