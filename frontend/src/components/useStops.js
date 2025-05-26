import { LOGICWAY_URL } from './config';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';

const useStops = (map) => {
  const [stops, setStops] = useState([]);
  const markersLayerRef = useRef(L.layerGroup());

  useEffect(() => {
    // Loading stops from the server
    fetch(`${LOGICWAY_URL}/api/stops/`)
      .then(res => res.json())
      .then(data => {
        setStops(data);
      })
      .catch(err => console.error('Error fetching stops:', err));
  }, []);

  useEffect(() => {
    // Adding stops to the map
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    stops.forEach(stop => {
      const { stop_lat, stop_lon, stop_name } = stop;

      L.circle([stop_lat, stop_lon], {
        color: '#931050',
        fillColor: '#931050',
        fillOpacity: 0.5,
        radius: 2,
      }).bindPopup(`<b>${stop_name}</b><br>Lat: ${stop_lat}, Lon: ${stop_lon}`)
        .addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [stops, map]);

  return stops;
};

export default useStops;
