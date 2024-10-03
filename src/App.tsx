import CssBaseline from '@mui/material/CssBaseline'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import 'maplibre-gl/dist/maplibre-gl.css'
import {useEffect, useRef} from 'react'
import React from 'react'

import './App.css'
import {
  CityFields,
  batchFetchPopulateCityData,
  cityFieldsFromLayers,
} from './apis'
import MapContainer from './components/Map'
import FloatingArrowMenu from './components/MapFab'
import Sidebar from './components/Sidebar'
import useLocalStorage from './customHooks'
import appSources, {LayerType} from './layers'
import {City} from './types'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d81b60',
    },
    secondary: {
      main: '#f06292',
    },
  },
})

function App() {
  const [cities, setCities] = useLocalStorage<City[]>('cities', [])
  const [enabledLayers, setEnabledLayers] = useLocalStorage<LayerType[]>(
    'layersOn',
    appSources.filter(layer => layer.defaultToggled).map(layer => layer.type),
  )
  const map = useRef<maplibregl.Map>()

  const updateCityData = async (currentCities: City[]) => {
    const cityFields: Set<CityFields> = cityFieldsFromLayers(enabledLayers)
    const updatedCities = await batchFetchPopulateCityData(
      currentCities,
      cityFields,
    )
    setCities([...updatedCities])
  }

  const handleAddCity = (newCity: City) => {
    const newCities = [...cities, newCity]
    setCities(newCities)
    updateCityData(newCities)
  }

  const handleRemoveCity = (cityName: string) => {
    setCities(prevCities => prevCities.filter(city => city.name !== cityName))
  }
  const flyToCity = (city: City) => {
    map?.current?.flyTo({
      center: [city.lon, city.lat],
      zoom: 10,
      speed: 3,
      curve: 2,
      easing(t) {
        return t
      },
      essential: true,
    })
  }

  useEffect(() => {
    updateCityData(cities)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledLayers])

  // Update temperature every 10 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        updateCityData(cities)
      },
      10 * 60 * 1000,
    )
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className='app'>
        <FloatingArrowMenu
          layers={appSources}
          enabledLayers={enabledLayers}
          onToggleEvent={layers => {
            setEnabledLayers(layers)
            updateCityData(cities)
          }}
        />
        <div className='sidebar-container'>
          <Sidebar
            cities={cities}
            onAddCity={handleAddCity}
            onRemoveCity={handleRemoveCity}
            onCityClick={flyToCity}
          />
        </div>
        <div className='map-container'>
          <MapContainer
            cities={cities}
            onCityClick={flyToCity}
            enabledLayers={enabledLayers}
            onAddCity={handleAddCity}
            onMapLoad={loadedMap => {
              map.current = loadedMap
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
