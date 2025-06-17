import { ROUTE_ENGINE_URL } from './config';

export const reverseGeocodeLocal = (lat, lon) => {
    const url = `${ROUTE_ENGINE_URL}/geocode/reverse_geocode?lat=${lat}&lon=${lon}`;
    return fetch(url)
      .then(res => res.json())
      .then(data => data.address || "No address found.")
      .catch(() => "Error when obtaining an address");
  };

export const geocodeAddress = async (address) => {
    try {
        const url = `${ROUTE_ENGINE_URL}/geocode/geocode?address=${encodeURIComponent(address)}`;
        console.log(`Geocoding: ${address} at ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();
        console.log("Geocoding response:", data);

        if (!data.latitude || !data.longitude) {
            throw new Error("No coordinates in response");
        }

        return [data.latitude, data.longitude];
    } catch (error) {
        console.error("Geocoding failed:", error);
        return null;
    }
};
  