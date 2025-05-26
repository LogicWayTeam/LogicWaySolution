import React, { useState } from 'react';
import RouteInputForm from './RouteInputForm';
import GeocoderSearchBar from './GeocoderSearchBar';

const RouteControlContainer = () => {
  const [showForm, setShowForm] = useState(false);

  const handleRouteSubmit = (origin, destination) => {
    console.log('Маршрут от:', origin, 'до:', destination);
    // Здесь будет логика построения маршрута
  };

  return (
    <>
      {showForm ? (
        <RouteInputForm
          onSubmit={handleRouteSubmit}
          onClose={() => setShowForm(false)} 
        />
      ) : (
        <GeocoderSearchBar
          onSearchClick={(place) => console.log('Искать:', place)}
          onRouteClick={() => setShowForm(true)} 
        />
      )}
    </>
  );
};

export default RouteControlContainer;
