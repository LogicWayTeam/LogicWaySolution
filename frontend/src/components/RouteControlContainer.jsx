import React, { useState } from 'react';
import RouteInputForm from './RouteInputForm';
import GeocoderSearchBar from './GeocoderSearchBar';

const RouteControlContainer = () => {
  const [showForm, setShowForm] = useState(false);
  const [geocoderMarker, setGeocoderMarker] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const handleRouteSubmit = (origin, destination) => {
    console.log('Маршрут от:', origin, 'до:', destination);
    // Здесь будет логика построения маршрута
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
            console.log('📌 Геокодер установил:', place);
            setGeocoderMarker(place); // ← сохраняем marker1
          }}
          onRouteClick={() => {
            if (geocoderMarker) {
              const value =
                geocoderMarker.label ||
                `${geocoderMarker.lat}, ${geocoderMarker.lng}`;
              setDestination(value);

              // Удаляем маркер с карты, если есть markerRef
              if (geocoderMarker.markerRef) {
                geocoderMarker.markerRef.remove(); // 🧹 удаление с карты
              }

              setGeocoderMarker(null); // очищаем состояние маркера
            } else {
              setDestination('');
            }

            setShowForm(true); // показываем форму
          }}

        />
      )}
    </>
  );
};

export default RouteControlContainer;
