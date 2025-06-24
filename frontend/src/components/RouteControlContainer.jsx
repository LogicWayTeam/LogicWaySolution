import React, { useState, useRef } from 'react';
import RouteInputForm from './RouteInputForm';
import GeocoderSearchBar from './GeocoderSearchBar';
import { useLeafletMap } from './MapComponent';
import useRouteBuilder from './useRouteBuilder';
import { ROUTE_ENGINE_URL } from './config';

const RouteControlContainer = ({ loading, setLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [, setGeocoderMarker] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const map = useLeafletMap();
  const routeLayerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { clearMap, setOriginPoint, setDestinationPoint } = useRouteBuilder(
    map,
    ROUTE_ENGINE_URL,
    setOrigin,
    setDestination,
    setGeocoderMarker,
    () => setShowForm(true),
    routeLayerRef,
    setLoading,
    abortControllerRef
  );

  const handleCloseForm = () => {
    setShowForm(false);
    setOrigin(null);
    setDestination(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearMap();
    setLoading(false);
  };

  const geocodeAddress = async (address) => {
    const url = `${ROUTE_ENGINE_URL}/geocode/geocode?address=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to geocode address: ${address}`);
    const data = await response.json();
    if (!data.latitude || !data.longitude) throw new Error(`No coordinates found for: ${address}`);
    return { lat: data.latitude, lng: data.longitude };
  };

  const handleRouteSubmit = async (originAddress, destinationAddress) => {
    try {
      setLoading(true);

      const [originCoords, destinationCoords] = await Promise.all([
        geocodeAddress(originAddress),
        geocodeAddress(destinationAddress),
      ]);

      await setOriginPoint(originCoords.lat, originCoords.lng, originAddress);
      await setDestinationPoint(destinationCoords.lat, destinationCoords.lng, destinationAddress);

    } catch (error) {
      alert('Failed to build route: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Blocking interaction with the map when loading
  React.useEffect(() => {
    if (!map) return;

    if (loading) {
      map._handlers.forEach(handler => handler.disable());
    } else {
      map._handlers.forEach(handler => handler.enable());
    }
  }, [loading, map]);

  return (
      <>
        {showForm ? (
            <RouteInputForm
                onRouteSubmit={handleRouteSubmit}
                onClose={handleCloseForm}
                origin={origin}
                destination={destination}
                setOrigin={setOrigin}
                setDestination={setDestination}
            />
        ) : (
            <GeocoderSearchBar
                onSearchClick={(place) => {
                  setGeocoderMarker(place);
                }}
                onRouteClick={() => {
                  setGeocoderMarker(prev => {
                    if (prev?.markerRef) {
                      prev.markerRef.remove();
                    }

                    const value =
                      prev?.label || (prev ? `${prev.lat}, ${prev.lng}` : '');

                    setDestination(value || '');
                    setShowForm(true); 

                    return null;
                  });
                }}
            />
        )}

      </>
  );
};

export default RouteControlContainer;