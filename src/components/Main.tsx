import {Collapse, useMediaQuery} from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useEffect, useRef, useState} from 'react';
import React from 'react';

import {
  CityFields,
  batchFetchPopulateCityData,
  cityFieldsFromLayers,
} from '../apis';
import appSources, {LayerType, appMapStyles} from '../layers';
import {LocalStorage, Storage, useStorage} from '../storage';
import {City, CityHelper} from '../types';
import MapContainer from './Map';
import FloatingArrowMenu from './MapFab';
import Sidebar from './Sidebar';
import FloatingArrowSidebar from './SidebarFab';

type FlyLoopState = {
  index: number;
  isLooping: boolean;
  interval?: NodeJS.Timeout;
};

interface AppProps {
  StorageClass: typeof Storage;
}

const Main: React.FC<AppProps> = ({StorageClass}) => {
  const [cities, setCities] = useStorage<City[]>(StorageClass, 'cities', []);
  const [enabledLayers, setEnabledLayers] = useStorage<LayerType[]>(
    LocalStorage,
    'layersOn',
    appSources
      .filter(layer => layer.defaultToggled)
      .map(layer => layer.type)
      .concat(
        appMapStyles
          .filter(layer => layer.defaultToggled)
          .map(layer => layer.type),
      ),
  );
  const [flyLoopState, setFlyLoopState] = useState<FlyLoopState>({
    index: 0,
    isLooping: false,
  });
  const isHighWidth = useMediaQuery('(min-width:600px)');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!isHighWidth);
  const map = useRef<maplibregl.Map>();

  const updateCityData = async (currentCities: City[]) => {
    const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers);
    const updatedCities = await batchFetchPopulateCityData(
      currentCities,
      cityFields,
    );
    setCities([...updatedCities]);
  };

  const handleAddCity = (newCity: City) => {
    // if mobile, we collapse the sidebar
    if (!isHighWidth) {
      setIsSidebarCollapsed(true);
    }
    // If duplicate, we fly to the city
    const helper = new CityHelper(newCity);
    if (cities.some(city => helper.id() === new CityHelper(city).id())) {
      flyToCity(newCity);
      return;
    }
    const newCities = [...cities, newCity];
    setCities(newCities);
    updateCityData(newCities);
  };

  const handleRemoveCity = (cityName: string) => {
    setCities(prevCities => prevCities.filter(city => city.name !== cityName));
  };
  const flyToCity = (city: City) => {
    map?.current?.flyTo({
      center: [city.lon, city.lat],
      zoom: 10,
      speed: 3,
      curve: 2,
      easing(t) {
        return t;
      },
      essential: true,
    });
  };

  useEffect(() => {
    updateCityData(cities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledLayers]);

  // Update temperature every 10 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        updateCityData(cities);
      },
      10 * 60 * 1000,
    );
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Collapse sidebar on small screens
  useEffect(() => {
    setIsSidebarCollapsed(!isHighWidth);
  }, [isHighWidth, setIsSidebarCollapsed]);

  // Fly loop
  useEffect(() => {
    // TODO there is no way to stop this but resfreshing the page
    if (flyLoopState.isLooping && !flyLoopState.interval && cities.length > 1) {
      flyToCity(cities[flyLoopState.index]);
      map.current?.once('moveend', () => {
        if (!flyLoopState.isLooping) return;
        const interval = setTimeout(() => {
          if (!flyLoopState.isLooping) return;
          setFlyLoopState({
            ...flyLoopState,
            index: (flyLoopState.index + 1) % cities.length,
          });
        }, 5000);
        setFlyLoopState({
          ...flyLoopState,
          interval,
        });
      });
    }
    if (!flyLoopState.isLooping && flyLoopState.interval) {
      map.current?.stop();
      clearInterval(flyLoopState.interval);
      setFlyLoopState({
        ...flyLoopState,
        interval: undefined,
      });
    }
  }, [cities, flyLoopState]);

  return (
    <div className='app'>
      <div style={{zIndex: 1000}}>
        <FloatingArrowMenu
          cities={cities}
          sources={appSources}
          styles={appMapStyles}
          enabledLayers={enabledLayers}
          onToggleEvent={layers => {
            setEnabledLayers(layers);
            updateCityData(cities);
          }}
          onFlyLoop={t => {
            if (t) {
              setFlyLoopState({
                ...flyLoopState,
                isLooping: t,
              });
            } else {
              setFlyLoopState({
                ...flyLoopState,
                isLooping: t,
              });
            }
          }}
        />
      </div>
      <div style={{zIndex: 4000}}>
        <FloatingArrowSidebar
          isCollapsed={isSidebarCollapsed}
          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }}
          sx={{
            left: isSidebarCollapsed ? '16px' : '-30vw',
            top: '24px',
          }}
        />
      </div>
      <Collapse
        in={!isSidebarCollapsed}
        orientation='horizontal'
        className='sidebar-container'
        sx={{
          transition: 'width 0.3s',
          width: isSidebarCollapsed
            ? '0px'
            : isHighWidth
              ? '30vw!important'
              : '100vw!important',
          minWidth: '300px',
          height: '100vh',
          zIndex: 2000,
        }}
        unmountOnExit
      >
        <Sidebar
          cities={cities}
          onAddCity={handleAddCity}
          onRemoveCity={handleRemoveCity}
          onCityClick={city => {
            // if mobile, we collapse the sidebar
            if (!isHighWidth) {
              setIsSidebarCollapsed(true);
            }
            flyToCity(city);
          }}
          isSidebarCollapsed={isSidebarCollapsed}
          onCollapseClicked={() => {
            setIsSidebarCollapsed(true);
          }}
        />
      </Collapse>
      <div className='map-container' style={{zIndex: 0}}>
        <MapContainer
          cities={cities}
          onCityClick={flyToCity}
          enabledLayers={enabledLayers}
          onAddCity={handleAddCity}
          onMapLoad={loadedMap => {
            map.current = loadedMap;
          }}
          hide={!isSidebarCollapsed && !isHighWidth}
          fullWidth={isSidebarCollapsed}
        />
      </div>
    </div>
  );
};
export default Main;
