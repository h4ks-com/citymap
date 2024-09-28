import {LayerSpecification} from "maplibre-gl";
import {CircleLayer, SymbolLayer} from "react-map-gl/dist/esm/exports-maplibre";
import {FloatingMenuLayer} from "./types";

export type LayerType = 'dots' | 'names' | 'time' | 'temperature';

export interface AppLayer extends FloatingMenuLayer {
  type: LayerType;
  spec: LayerSpecification;
}

const dotsStyle: CircleLayer = {
  id: 'point',
  type: 'circle',
  source: 'circle',
  paint: {
    'circle-radius': 12,
    'circle-color': '#cc1236dd'
  }
};

const nameStyle: SymbolLayer = {
  id: 'labels',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-font': ["Times New Roman Bold"],
    'text-field': ['get', 'name'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 20,
  },
  paint: {
    'text-color': '#000000',
    'text-halo-color': '#ffffff',
    'text-halo-width': 2,
  }
};

const subtextStyle: SymbolLayer = {
  id: 'subtext',
  type: 'symbol',
  source: 'circle',
  layout: {
    'text-font': ["Nunito Semi Bold"],
    'text-field': ['get', 'subtext'],
    'text-variable-anchor': ['top'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 15,
  },
  paint: {
    'text-color': '#111111',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1.5,
  }
};


const appLayers: AppLayer[] = [
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
    spec: subtextStyle,
    toggleable: true,
  },
  {
    type: 'temperature',
    name: 'Temperature',
    description: 'Temperature in Celsius',
    defaultToggled: false,
    spec: subtextStyle,
    toggleable: true,
  },
]

export default appLayers;
