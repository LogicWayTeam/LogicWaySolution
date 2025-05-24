import { useEffect } from 'react';

const useRouteButton = (onClick) => {
  useEffect(() => {
    setTimeout(() => {
      const container = document.querySelector('.leaflet-control-geocoder');
      if (container) {
        const routeButton = document.createElement('button');
        routeButton.className = 'route-button';
 
        const icon = document.createElement('i');
        icon.className = 'fa fa-route';
        routeButton.appendChild(icon);

        routeButton.onclick = onClick;
        container.appendChild(routeButton);
 
        routeButton.onclick = () => {
          console.log('Нажата кнопка "Маршрут"');
          if (onClick) onClick(); // вызываем переданную функцию
        };
        
      }
    }, 0);
  }, [onClick]);
};

export default useRouteButton;
