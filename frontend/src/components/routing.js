import { ROUTE_ENGINE_URL } from './config';
import L from 'leaflet';

export const buildRoute = async (map, stops, routeLayerRef, profile = 'pedestrian', color = '#c40035') => {
  const points = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
  const url = `${ROUTE_ENGINE_URL}/route/get_route?profile=${profile}&locations=${points}`;

  console.log('Profile:', profile); // Логирование профиля

  console.log(`Requesting route from: ${url}`);  // Логирование URL запроса

   if (typeof profile !== 'string') {
    console.error('Profile must be a string. Received:', profile);
    return;
  }
  

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log('Route data received:', data);  // Логирование полученных данных

    if (data.error) {
      console.error('Error in route data:', data.error);
      return;
    }

    if (data.geometry && data.duration) {
      const latLngs = data.geometry.map(([lng, lat]) => [lat, lng]);

      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }

      routeLayerRef.current = L.polyline(latLngs, { color, weight: 5 }).addTo(map);
      map.fitBounds(routeLayerRef.current.getBounds());
    } else {
      console.error("Invalid route data", data);
    }
  } catch (error) {
    console.error('Error fetching route:', error);
  }
};
