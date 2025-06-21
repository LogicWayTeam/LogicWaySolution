import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import '../App.css';
import ZoomControl from './ZoomControl';
import useStops from './useStops';
import { POZNAN_CENTER } from './constants';
import { ROUTE_ENGINE_URL } from './config';
import RouteControlContainer from './RouteControlContainer';
import MapOverlay from './MapOverlay';

// --- Map Context ---
export const MapContext = createContext(null);
export const useLeafletMap = () => useContext(MapContext);

const MapLogic = ({ children }) => {
  const map = useMap();

  useStops(map);

  return (
    <MapContext.Provider value={map}>
      {children}
    </MapContext.Provider>
  );
};


const MapComponent = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        center={POZNAN_CENTER}
        zoom={13}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ZoomControl />
        <MapLogic>
          <RouteControlContainer loading={loading} setLoading={setLoading} />
        </MapLogic>
      </MapContainer>

      <MapOverlay loading={loading} />
    </div>
  );
};

export default MapComponent;
