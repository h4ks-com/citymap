import sha256 from 'crypto-js/sha256';

export interface City {
  name: string;
  lat: number;
  lon: number;
  timezone?: string;
  temperature?: number;
}

export class CityHelper {
  city: City

  constructor(city: City) {
    this.city = city;
  }

  id(): string {
    // Returns hash of city coordinates and name
    return sha256(`${this.city.lat}${this.city.lon}${this.city.name}`).toString();
  }

  formatedCurrentTime(): string {
    if (!this.city.timezone) {
      return '00:00:00';
    }
    return (new Date()).toLocaleString([], {timeZone: this.city.timezone}).split(", ")[1]
  }
}

export interface FloatingMenuLayer {
  type: string;
  name: string;
  description: string;
  defaultToggled: boolean;
  toggleable: boolean;
}

export interface CityManagerProps {
  cities: City[];
  onAddCity?: (city: City) => void;
  onRemoveCity?: (cityName: string) => void;
}

