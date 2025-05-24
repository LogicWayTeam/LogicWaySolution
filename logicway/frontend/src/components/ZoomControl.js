import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ZoomControl = () => {
  const map = useMap();

  useEffect(() => {
    const control = L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      control.remove();
    };
  }, [map]);

  return null;
};

export default ZoomControl;