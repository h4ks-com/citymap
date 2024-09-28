import {LayerSpecification} from "maplibre-gl";
import {FloatingMenuLayer} from "./layersMenu";
import {CircleLayer, SymbolLayer} from "react-map-gl/dist/esm/exports-maplibre";

interface AppLayer extends FloatingMenuLayer {
  spec: LayerSpecification;
}

const layerStyle: SymbolLayer = {
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

const pointsStyle: CircleLayer = {
  id: 'point',
  type: 'circle',
  source: 'circle',
  paint: {
    'circle-radius': 12,
    'circle-color': '#cc1236dd'
  }
};


const layers: AppLayer[] = [
  {type: 'dots', name: 'Markers', description: 'Red dots on the map', spec: pointsStyle},
  {type: 'names', name: 'Names', description: 'Names of the city or region', spec: layerStyle},
]

export default layers;
