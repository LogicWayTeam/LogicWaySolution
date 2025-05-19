import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { redIcon } from './constants';

const useGeocoder = (map) => {
  const searchMarkerRef = useRef(null);

  useEffect(() => {
    const geocoderControl = L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      placeholder: 'Enter address...',
      defaultMarkGeocode: false,
      position: 'topright',
      collapsed: false,
    })
      .on('markgeocode', function (e) {
        const latlng = e.geocode.center;

        if (searchMarkerRef.current) {
          map.removeLayer(searchMarkerRef.current);
        }

        const marker = L.marker(latlng, { icon: redIcon })
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();

        searchMarkerRef.current = marker;

        map.setView(latlng, 13);
      })
      .addTo(map);

    return () => {
      geocoderControl.remove();
    };
  }, [map]);

  return searchMarkerRef;
};

export default useGeocoder;
