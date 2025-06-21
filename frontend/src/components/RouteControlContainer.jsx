import React, { useState, useRef } from 'react';
import RouteInputForm from './RouteInputForm';
import GeocoderSearchBar from './GeocoderSearchBar';
import { useLeafletMap } from './MapComponent';
import useRouteBuilder from './useRouteBuilder';
import { ROUTE_ENGINE_URL } from './config';

const RouteControlContainer = ({ loading, setLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [geocoderMarker, setGeocoderMarker] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const map = useLeafletMap();
  const routeLayerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { clearMap } = useRouteBuilder(
    map,
    ROUTE_ENGINE_URL,
    setOrigin,
    setDestination,
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

  const handleRouteSubmit = (origin, destination) => {
    // TODO: route building logic
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
                  if (geocoderMarker) {
                    const value =
                        geocoderMarker.label ||
                        `${geocoderMarker.lat}, ${geocoderMarker.lng}`;
                    setDestination(value);

                    if (geocoderMarker.markerRef) {
                      geocoderMarker.markerRef.remove();
                    }

                    setGeocoderMarker(null);
                  } else {
                    setDestination('');
                  }

                  setShowForm(true);
                }}
            />
        )}

      </>
  );
};

export default RouteControlContainer;