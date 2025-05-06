import L from 'leaflet';

export const ROUTE_ENGINE_URL = 'http://127.0.0.1:8000'; //delete hard code

export const POZNAN_CENTER = [52.406376, 16.925167];

export const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
