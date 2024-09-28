export interface City {
  name: string;
  lat: number;
  lon: number;
  time?: Date;
  temperature?: number;
}

export interface FloatingMenuLayer {
  type: string;
  name: string;
  description: string;
  defaultToggled: boolean;
  toggleable: boolean;
}
