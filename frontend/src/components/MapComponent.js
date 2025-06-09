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
import { POZNAN_CENTER, redIcon } from './constants';
import useRouteButton from './useRouteButton';
import useRouteBuilder from './useRouteBuilder';
import { ROUTE_ENGINE_URL } from './config';
import RouteControlContainer from './RouteControlContainer';
import GeocoderSearchBar from './GeocoderSearchBar';

// --- Map Context ---
export const MapContext = createContext(null);
export const useLeafletMap = () => useContext(MapContext);

const MapLogic = ({ children }) => {
  const map = useMap();

  useStops(map);
  useRouteBuilder(map, ROUTE_ENGINE_URL);

  return (
    <MapContext.Provider value={map}>
      {children}
    </MapContext.Provider>
  );
};


const MapComponent = () => {
  return (
    <MapContainer
    center={[52.406376, 16.925167]}
    zoom={13}
    zoomControl={false}
    style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ZoomControl />
      <MapLogic>
        <RouteControlContainer />
      </MapLogic>
    </MapContainer>
  );
};

export default MapComponent;
