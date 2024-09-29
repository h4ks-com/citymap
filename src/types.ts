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
      return 'Unknown';
    }
    return (new Date()).toLocaleString([], {timeZone: this.city.timezone}).split(", ")[1]
  }

  formatedTemperature(): string {
    if (!this.city.temperature) {
      return '(?)C';
    }
    return `${this.city.temperature}C`;
  }
}

export interface FloatingMenuLayer {
  type: string;
  name: string;
  description: string;
  defaultToggled: boolean;
  toggleable: boolean;
}
