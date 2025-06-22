import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { reverseGeocodeLocal } from './geocoding';
import { buildRoute } from './routing';
import { redIcon } from './constants';
import { startIcon } from './leafletIcons';
import bindPersistentPopup from './bindPersistentPopup';


const useRouteBuilder = ( map, ROUTE_ENGINE_URL, setOrigin, setDestination, setGeocoderMarker, openForm, routeLayerRef, setLoading, abortControllerRef ) => {
  const lastLMarkerRef = useRef(null);
  const lastRMarkerRef = useRef(null);
  const originAddressRef = useRef('');
  const destinationAddressRef = useRef('');

  useEffect(() => {
    if (!map) return;

    const tryBuildRoute = () => {
      if (lastLMarkerRef.current && lastRMarkerRef.current) {
        const originLatLng = lastRMarkerRef.current.getLatLng();
        const destinationLatLng = lastLMarkerRef.current.getLatLng();

        setOrigin(originAddressRef.current); 
        setDestination(destinationAddressRef.current); 

        if (setGeocoderMarker) {
          setGeocoderMarker(prev => {
            if (prev?.markerRef) {
              prev.markerRef.remove();
            }
            return null;
          });
        }

        openForm();

        setLoading(true);

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        buildRoute(
          map,
          [destinationLatLng, originLatLng],
          routeLayerRef,
          '#c40035',
          controller.signal
        ).finally(() => {
          setLoading(false);
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }}
        );
      }
    };

    const handleClick = async (e) => {
      e.originalEvent.preventDefault();
      const address = await reverseGeocodeLocal(e.latlng.lat, e.latlng.lng, ROUTE_ENGINE_URL);

      destinationAddressRef.current = address;

      if (lastLMarkerRef.current) {
        map.removeLayer(lastLMarkerRef.current);
      }

      lastLMarkerRef.current = L.marker(e.latlng, { icon: redIcon }).addTo(map);
      bindPersistentPopup(lastLMarkerRef.current, address);

      tryBuildRoute();
    };

    const handleRightClick = async (e) => {
      e.originalEvent.preventDefault();
      const address = await reverseGeocodeLocal(e.latlng.lat, e.latlng.lng, ROUTE_ENGINE_URL);

      originAddressRef.current = address;

      if (lastRMarkerRef.current) {
        map.removeLayer(lastRMarkerRef.current);
      }

      lastRMarkerRef.current = L.marker(e.latlng, { icon: startIcon }).addTo(map);
      bindPersistentPopup(lastRMarkerRef.current, address);

      tryBuildRoute();
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleRightClick);

    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleRightClick);
    };
  }, [map, ROUTE_ENGINE_URL, openForm, setOrigin, setDestination, setGeocoderMarker, routeLayerRef, setLoading, abortControllerRef]);

  const clearMap = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (lastLMarkerRef.current) {
      map.removeLayer(lastLMarkerRef.current);
      lastLMarkerRef.current = null;
    }

    if (lastRMarkerRef.current) {
      map.removeLayer(lastRMarkerRef.current);
      lastRMarkerRef.current = null;
    }

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    originAddressRef.current = '';
    destinationAddressRef.current = '';
  };

  return { clearMap };
};

export default useRouteBuilder;
