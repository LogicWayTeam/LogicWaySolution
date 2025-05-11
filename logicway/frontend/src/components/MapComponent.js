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



const MapLogic = () => {
  const map = useMap();

  //const lastLMarkerRef = useRef(null);
  //const lastRMarkerRef = useRef(null);
  //const routeLineRef = useRef(null);

  const searchMarkerRef = useGeocoder(map);
  const stops = useStops(map);

  useRouteButton();
  useRouteBuilder(map, ROUTE_ENGINE_URL);


  //delete
  /*
  function reverseGeocodeLocal(lat, lon, callback) {
    const route_engine = `${ROUTE_ENGINE_URL}/geocode/reverse_geocode?lat=${lat}&lon=${lon}`;

    fetch(route_engine)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                console.log(data.address);
                callback(data.address);
            } else {
                callback("No address found.");
            }
        })
        .catch(error => callback(error));
  }

  function buildRoute(stops, profile, color) {
    const points = stops.map(p => `${p.lng},${p.lat}`).join(';');
    const valhallaURL = `${ROUTE_ENGINE_URL}/route/get_route?profile=${profile}&locations=${points}`;

    fetch(valhallaURL)
      .then(res => res.json())
      .then(data => {
        if (data.geometry) {
          const latLngs = data.geometry.map(p => [p[1], p[0]]);

          if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
          }

          const line = L.polyline(latLngs, { color, weight: 5 }).addTo(map);
          routeLineRef.current = line;
          map.fitBounds(line.getBounds());
        }
      })
      .catch(err => console.error("Routing error", err));
  }

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      reverseGeocodeLocal(lat, lng, address => {
        if (lastLMarkerRef.current) {
          map.removeLayer(lastLMarkerRef.current);
        }
  
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        })
          .addTo(map)
          .bindPopup(`Start: ${address}`)
          .openPopup();
  
        lastLMarkerRef.current = marker;
  
        if (lastLMarkerRef.current && lastRMarkerRef.current) {
          buildRoute([lastLMarkerRef.current.getLatLng(), lastRMarkerRef.current.getLatLng()], 'pedestrian', 'red');
        }
      });
    };
  
    const handleContextMenu = (e) => {
      const { lat, lng } = e.latlng;
      reverseGeocodeLocal(lat, lng, address => {
        if (lastRMarkerRef.current) {
          map.removeLayer(lastRMarkerRef.current);
        }
  
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        })
          .addTo(map)
          .bindPopup(`End: ${address}`)
          .openPopup();
  
        lastRMarkerRef.current = marker;
  
        if (lastLMarkerRef.current && lastRMarkerRef.current) {
          buildRoute([lastLMarkerRef.current.getLatLng(), lastRMarkerRef.current.getLatLng()], 'pedestrian', 'red');
        }
      });
    };
  
    map.on('click', handleClick);
    map.on('contextmenu', handleContextMenu);
  
    // 🧼 Очистка при размонтировании компонента
    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleContextMenu);
    };
  }, [map]);
  */
  //delete

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
      <MapLogic />
    </MapContainer>
  );
};

export default MapComponent;
