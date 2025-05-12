import React, { useState } from 'react';
import useRouteButton from './useRouteButton';
import RouteInputForm from './RouteInputForm';

const RouteControlContainer = () => {
  const [showForm, setShowForm] = useState(false);

  // Передаём функцию в хук, чтобы он показал форму
  useRouteButton(() => setShowForm(true));

  const handleRouteSubmit = (origin, destination) => {
    console.log('Маршрут от:', origin, 'до:', destination);
    // Здесь будет логика построения маршрута
  };

  return (
    <div>
      {showForm ? (
        <RouteInputForm onSubmit={handleRouteSubmit} />
      ) : (
        null // здесь может быть геокодер по умолчанию, если нужен
      )}
    </div>
  );
};

export default RouteControlContainer;
