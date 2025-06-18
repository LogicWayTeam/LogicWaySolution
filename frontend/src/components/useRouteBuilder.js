import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { reverseGeocodeLocal } from './geocoding';
import { buildRoute } from './routing';
import { redIcon } from './constants';
<<<<<<< HEAD
import { ROUTE_ENGINE_URL } from './config';
import { startIcon } from './leafletIcons';
=======
import { startIcon, endIcon } from './leafletIcons';
>>>>>>> origin/main


const useRouteBuilder = (map, ROUTE_ENGINE_URL) => {
  const lastLMarkerRef = useRef(null);
  const lastRMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const tryBuildRoute = () => {
      if (lastLMarkerRef.current && lastRMarkerRef.current) {
        buildRoute(
          map,
          [
            lastLMarkerRef.current.getLatLng(),
            lastRMarkerRef.current.getLatLng()
          ],
          routeLayerRef,
          'pedestrian'
        );
      }
    };

    const handleClick = async (e) => {
      e.originalEvent.preventDefault();
      const address = await reverseGeocodeLocal(e.latlng.lat, e.latlng.lng, ROUTE_ENGINE_URL);

      if (lastLMarkerRef.current) {
        map.removeLayer(lastLMarkerRef.current);
      }

      lastLMarkerRef.current = L.marker(e.latlng, { icon: redIcon })
        .addTo(map)
        .bindPopup(address)
        .openPopup();

<<<<<<< HEAD
      tryBuildRoute();
=======
      if (lastLMarkerRef.current && lastRMarkerRef.current) {
        buildRoute(
          map,
          [
            lastLMarkerRef.current.getLatLng(),
            lastRMarkerRef.current.getLatLng()
          ],
          routeLayerRef,
        );
      }
>>>>>>> origin/main
    };

    const handleRightClick = async (e) => {
      e.originalEvent.preventDefault();
      const address = await reverseGeocodeLocal(e.latlng.lat, e.latlng.lng, ROUTE_ENGINE_URL);

      if (lastRMarkerRef.current) {
        map.removeLayer(lastRMarkerRef.current);
      }

      lastRMarkerRef.current = L.marker(e.latlng, { icon: startIcon })
        .addTo(map)
        .bindPopup(address)
        .openPopup();

<<<<<<< HEAD
      tryBuildRoute();
=======
      if (lastLMarkerRef.current && lastRMarkerRef.current) {
        buildRoute(
          map,
          [
            lastLMarkerRef.current.getLatLng(),
            lastRMarkerRef.current.getLatLng()
          ],
          routeLayerRef,       // Слой маршрута
        );
      }
>>>>>>> origin/main
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleRightClick);

    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleRightClick);
    };
  }, [map], [ROUTE_ENGINE_URL]);
};

export default useRouteBuilder;
