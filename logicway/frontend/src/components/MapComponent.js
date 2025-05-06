import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import '../App.css';
import ZoomControl from './ZoomControl';

const ROUTE_ENGINE_URL = 'http://127.0.0.1:8000';//delete hard code

const MapLogic = () => {
  const map = useMap();

  const lastLMarkerRef = useRef(null);
  const lastRMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [stops, setStops] = useState([]);
  const markersLayerRef = useRef(L.layerGroup());
  const searchMarkerRef = useRef(null);

  useEffect(() => {
    const poznanCenter = [52.406376, 16.925167];
    map.setView(poznanCenter, 13);

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const geocoderControl = L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      placeholder: 'Enter address...',
      defaultMarkGeocode: false,
      position: 'topleft',
      collapsed: false,
    })
    .on('markgeocode', function (e) {
      const latlng = e.geocode.center;
    
      // Удаляем предыдущий маркер, если он есть
      if (searchMarkerRef.current) {
        map.removeLayer(searchMarkerRef.current);
      }
    
      // Создаем и сохраняем новый маркер
      const marker = L.marker(latlng, { icon: redIcon })
        .addTo(map)
        .bindPopup(e.geocode.name)
        .openPopup();
    
      searchMarkerRef.current = marker;
    
      map.setView(latlng, 13);
    })
      .addTo(map);

    // Добавим проверку, чтобы убедиться, что геокодер добавлен
    setTimeout(() => {
      const geocoderIcon = document.querySelector('.leaflet-control-geocoder-icon');
      const submitButton = document.querySelector('.leaflet-control-geocoder-form button[type="submit"]');
  
      if (geocoderIcon && submitButton) {
        geocoderIcon.addEventListener('click', () => {
          console.log('Клик по иконке геокодера');
          submitButton.click(); // переменная видна и доступна здесь
        });
      } else {
        console.warn('Не найдена иконка или кнопка отправки формы');
      }
    }, 1000);
    
    

      
    // route button
    setTimeout(() => {
      const container = document.querySelector('.leaflet-control-geocoder');
      if (container) {
        const routeButton = document.createElement('button');
        routeButton.className = 'route-button';  // Класс для стилизации
    
        // Добавляем лупу или текст, если нужно
        const icon = document.createElement('i');  // Добавляем иконку или текст
        icon.className = 'fa fa-route'; // Используй класс Font Awesome для иконки маршрута
        routeButton.appendChild(icon);
    
        routeButton.onclick = () => {
          console.log('Нажата кнопка "Маршрут"');
          // Вставь свою логику построения маршрута
        };
        container.appendChild(routeButton);
      }
    }, 0);

  }, [map]);


  //delete
  function reverseGeocodeLocal(lat, lon, callback) {
    const route_engine = `${ROUTE_ENGINE_URL}/geocode/reverse_geocode?lat=${lat}&lon=${lon}`;

    fetch(route_engine)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                console.log(data.address);
                callback(data.address);
            } else {
                callback("No address found.");
            }
        })
        .catch(error => callback(error));
}

  function buildRoute(stops, profile, color) {
    const points = stops.map(p => `${p.lng},${p.lat}`).join(';');
    const valhallaURL = `${ROUTE_ENGINE_URL}/route/get_route?profile=${profile}&locations=${points}`;

    fetch(valhallaURL)
      .then(res => res.json())
      .then(data => {
        if (data.geometry) {
          const latLngs = data.geometry.map(p => [p[1], p[0]]);

          if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
          }

          const line = L.polyline(latLngs, { color, weight: 5 }).addTo(map);
          routeLineRef.current = line;
          map.fitBounds(line.getBounds());
        }
      })
      .catch(err => console.error("Routing error", err));
  }

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      reverseGeocodeLocal(lat, lng, address => {
        if (lastLMarkerRef.current) {
          map.removeLayer(lastLMarkerRef.current);
        }
  
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        })
          .addTo(map)
          .bindPopup(`Start: ${address}`)
          .openPopup();
  
        lastLMarkerRef.current = marker;
  
        if (lastLMarkerRef.current && lastRMarkerRef.current) {
          buildRoute([lastLMarkerRef.current.getLatLng(), lastRMarkerRef.current.getLatLng()], 'pedestrian', 'red');
        }
      });
    };
  
    const handleContextMenu = (e) => {
      const { lat, lng } = e.latlng;
      reverseGeocodeLocal(lat, lng, address => {
        if (lastRMarkerRef.current) {
          map.removeLayer(lastRMarkerRef.current);
        }
  
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        })
          .addTo(map)
          .bindPopup(`End: ${address}`)
          .openPopup();
  
        lastRMarkerRef.current = marker;
  
        if (lastLMarkerRef.current && lastRMarkerRef.current) {
          buildRoute([lastLMarkerRef.current.getLatLng(), lastRMarkerRef.current.getLatLng()], 'pedestrian', 'red');
        }
      });
    };
  
    map.on('click', handleClick);
    map.on('contextmenu', handleContextMenu);
  
    // 🧼 Очистка при размонтировании компонента
    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleContextMenu);
    };
  }, [map]);
  //delete


  useEffect(() => {
    // Загружаем остановки с сервера
    fetch('http://127.0.0.1:8000/api/stops/')
      .then(res => res.json())
      .then(data => {
        setStops(data);
      })
      .catch(err => console.error('Error fetching stops:', err));
  }, []);

  useEffect(() => {
    // Добавляем остановки на карту
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    stops.forEach(stop => {
      const { stop_lat, stop_lon, stop_name } = stop;

      L.circle([stop_lat, stop_lon], {
        color: '#931050',
        fillColor: '#931050',
        fillOpacity: 0.5,
        radius: 2,
      }).bindPopup(`<b>${stop_name}</b><br>Lat: ${stop_lat}, Lon: ${stop_lon}`)
        .addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [stops, map]);

  return null;
};



const MapComponent = () => {
  return (
    <MapContainer
    center={[52.406376, 16.925167]}
    zoom={13}
    zoomControl={false}
    style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ZoomControl />
      <MapLogic />
    </MapContainer>
  );
};

export default MapComponent;
