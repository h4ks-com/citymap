import {LayerSpecification} from 'maplibre-gl';
import {CircleLayer, SymbolLayer} from 'react-map-gl/dist/esm/exports-maplibre';

import {FloatingMenuLayer} from './types';

export type LayerType =
  | 'dots'
  | 'names'
  | 'time'
  | 'temperature'
  | 'satellite'
  | 'default';

export interface AppLayer extends FloatingMenuLayer {
  type: LayerType;
  spec: LayerSpecification;
}

export interface AppMapStyle extends FloatingMenuLayer {
  type: LayerType;
  style: string;
}

const dotsStyle: CircleLayer = {
  id: 'point',
  type: 'circle',
  source: 'circle',
  paint: {
    'circle-radius': 8,
    'circle-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#faa',
      '#dd1236ff',
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      5,
      0,
    ],
    'circle-stroke-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#ff9',
      '#ffffff',
    ],
    'circle-stroke-opacity': 0.8,
  },
};

const nameStyle: SymbolLayer = {
  id: 'labels',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-font': ['Times New Roman Bold'],
    'text-field': ['get', 'name'],
    'text-variable-anchor': ['bottom'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 18,
  },
  paint: {
    'text-color': '#000000',
    'text-halo-blur': 2,
    'text-halo-color': '#ffffff',
    'text-halo-width': 1.5,
  },
};

const timeLayer: SymbolLayer = {
  id: 'time',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-font': ['Nunito Semi Bold'],
    'text-field': ['get', 'time'],
    'text-variable-anchor': ['top'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 15,
  },
  paint: {
    'text-color': '#111111',
    'text-halo-color': '#eeed',
    'text-halo-blur': 1,
    'text-halo-width': 2,
  },
};

const tempLayer: SymbolLayer = {
  id: 'temperature',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-font': ['Nunito Semi Bold'],
    'text-field': ['concat', ['coalesce', ['get', 'temperature'], '(?)'], 'C'],
    'text-variable-anchor': ['left'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 14,
  },
  paint: {
    'text-color': [
      'case',
      ['<', ['coalesce', ['get', 'temperature'], 0], 21],
      '#0000ff',
      '#ff0000',
    ],
    'text-halo-color': '#fffd',
    'text-halo-blur': 1,
    'text-halo-width': 1.5,
  },
};

const appSources: AppLayer[] = [
  {
    type: 'dots',
    name: 'Markers',
    description: 'Red dots on the map',
    defaultToggled: true,
    spec: dotsStyle,
    toggleable: false,
  },
  {
    type: 'names',
    name: 'Names',
    description: 'Names of the city or region',
    defaultToggled: true,
    spec: nameStyle,
    toggleable: true,
  },
  {
    type: 'time',
    name: 'Local Time',
    description: 'Local time',
    defaultToggled: false,
    spec: timeLayer,
    toggleable: true,
  },
  {
    type: 'temperature',
    name: 'Temperature',
    description: 'Temperature in Celsius',
    defaultToggled: false,
    spec: tempLayer,
    toggleable: true,
  },
];

const appMapStyles: AppMapStyle[] = [
  {
    type: 'default',
    name: 'Default',
    description: 'Default map view',
    defaultToggled: true,
    toggleable: true,
    style: `${process.env.PUBLIC_URL}/style.json`,
  },
  {
    type: 'satellite',
    name: 'Satellite',
    description: 'Satellite imagery view',
    defaultToggled: false,
    toggleable: true,
    style:
      'https://api.maptiler.com/maps/hybrid/style.json?key=OVCTzuFLwqkHSOwHpV5x',
  },
];

export default appSources;
export {appMapStyles};
