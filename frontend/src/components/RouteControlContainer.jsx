import React, { useState } from 'react';
import RouteInputForm from './RouteInputForm';
import GeocoderSearchBar from './GeocoderSearchBar';

const RouteControlContainer = () => {
  const [showForm, setShowForm] = useState(false);
  const [geocoderMarker, setGeocoderMarker] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const handleRouteSubmit = (origin, destination) => {
    // TODO: route building logic
  };

  return (
    <>
      {showForm ? (
        <RouteInputForm
          onRouteSubmit={handleRouteSubmit}
          onClose={() => setShowForm(false)} 
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
