import { useEffect } from 'react';

const useRouteButton = () => {
  useEffect(() => {
    setTimeout(() => {
      const container = document.querySelector('.leaflet-control-geocoder');
      if (container) {
        const routeButton = document.createElement('button');
        routeButton.className = 'route-button';
 
        const icon = document.createElement('i');
        icon.className = 'fa fa-route';
        routeButton.appendChild(icon);
 
        routeButton.onclick = () => {
          console.log('Нажата кнопка "Маршрут"');
          // Вставьте свою логику построения маршрута
        };
        container.appendChild(routeButton);
      }
    }, 0);
  }, []);
};

export default useRouteButton;
