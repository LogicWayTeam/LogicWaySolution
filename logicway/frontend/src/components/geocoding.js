import { ROUTE_ENGINE_URL } from './config';

export const reverseGeocodeLocal = (lat, lon) => {
    const url = `${ROUTE_ENGINE_URL}/geocode/reverse_geocode?lat=${lat}&lon=${lon}`;
    return fetch(url)
      .then(res => res.json())
      .then(data => data.address || "No address found.")
      .catch(() => "Error when obtaining an address");
  };
  