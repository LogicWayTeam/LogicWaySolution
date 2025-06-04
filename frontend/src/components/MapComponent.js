import React, { useEffect, useRef, useState } from 'react';
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
import useGeocoder from './useGeocoder';
import useRouteButton from './useRouteButton';
import useRouteBuilder from './useRouteBuilder';
import { ROUTE_ENGINE_URL } from './config';
import RouteControlContainer from './RouteControlContainer';
import GeocoderSearchBar from './GeocoderSearchBar';



const MapLogic = () => {
  const map = useMap();

  const searchMarkerRef = useGeocoder(map);
  const stops = useStops(map);

  useRouteBuilder(map, ROUTE_ENGINE_URL);

  return null;
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
      <RouteControlContainer />
      <MapLogic />
    </MapContainer>
  );
};

export default MapComponent;
