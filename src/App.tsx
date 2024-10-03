import {Collapse, useMediaQuery} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import 'maplibre-gl/dist/maplibre-gl.css'
import {useEffect, useRef, useState} from 'react'
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
import FloatingArrowSidebar from './components/SidebarFab'
import useLocalStorage from './customHooks'
import appSources, {LayerType} from './layers'
import {City, CityHelper} from './types'

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isHighWidth = useMediaQuery('(min-width:600px)')
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
    // if mobile, we collapse the sidebar
    if (!isHighWidth) {
      setIsSidebarCollapsed(true)
    }
    // If duplicate, we fly to the city
    const helper = new CityHelper(newCity)
    if (cities.some(city => helper.id() === new CityHelper(city).id())) {
      flyToCity(newCity)
      return
    }
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

  // Collapse sidebar on small screens
  useEffect(() => {
    setIsSidebarCollapsed(!isHighWidth)
  }, [isHighWidth, setIsSidebarCollapsed])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className='app'>
        <div style={{zIndex: 1000}}>
          <FloatingArrowMenu
            layers={appSources}
            enabledLayers={enabledLayers}
            onToggleEvent={layers => {
              setEnabledLayers(layers)
              updateCityData(cities)
            }}
          />
        </div>
        <div style={{zIndex: 3000}}>
          <FloatingArrowSidebar
            isCollapsed={isSidebarCollapsed}
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed)
            }}
            sx={{
              left: isSidebarCollapsed ? '16px' : isHighWidth ? '18vw' : '90vw',
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
                setIsSidebarCollapsed(true)
              }
              flyToCity(city)
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
        </Collapse>
        <div className='map-container' style={{zIndex: 0}}>
          <MapContainer
            cities={cities}
            onCityClick={flyToCity}
            enabledLayers={enabledLayers}
            onAddCity={handleAddCity}
            onMapLoad={loadedMap => {
              map.current = loadedMap
            }}
            hide={!isSidebarCollapsed && !isHighWidth}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
