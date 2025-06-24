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

  const setOriginPoint = async (lat, lng, address = null) => {
    const resolvedAddress = address || await reverseGeocodeLocal(lat, lng, ROUTE_ENGINE_URL);
    originAddressRef.current = resolvedAddress;

    if (lastRMarkerRef.current) {
      map.removeLayer(lastRMarkerRef.current);
    }

    const latlng = L.latLng(lat, lng);
    lastRMarkerRef.current = L.marker(latlng, { icon: startIcon }).addTo(map);
    bindPersistentPopup(lastRMarkerRef.current, resolvedAddress);

    tryBuildRoute();
  };

  const setDestinationPoint = async (lat, lng, address = null) => {
    const resolvedAddress = address || await reverseGeocodeLocal(lat, lng, ROUTE_ENGINE_URL);
    destinationAddressRef.current = resolvedAddress;

    if (lastLMarkerRef.current) {
      map.removeLayer(lastLMarkerRef.current);
    }

    const latlng = L.latLng(lat, lng);
    lastLMarkerRef.current = L.marker(latlng, { icon: redIcon }).addTo(map);
    bindPersistentPopup(lastLMarkerRef.current, resolvedAddress);

    tryBuildRoute();
  };

  useEffect(() => {
    if (!map) return;

    const handleClick = async (e) => {
      e.originalEvent.preventDefault();
      await setDestinationPoint(e.latlng.lat, e.latlng.lng);
    };

    const handleRightClick = async (e) => {
      e.originalEvent.preventDefault();
      await setOriginPoint(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleRightClick);

    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleRightClick);
    };
  }, [map, ROUTE_ENGINE_URL]);

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

  return { clearMap, setOriginPoint, setDestinationPoint };
};

export default useRouteBuilder;
