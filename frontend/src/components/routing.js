import { LOGICWAY_URL } from './config';
import L from 'leaflet';

export const buildRoute = async (map, stops, routeLayerRef, color = '#c40035') => {
  if (!stops || stops.length < 2) {
    console.error('At least two stops are required to build a route.');
    return;
  }

  const start = stops[0];
  const end = stops[stops.length - 1];
  const url = `${LOGICWAY_URL}/routing/SimpleGreedySearch?start_lat=${start.lat}&start_lon=${start.lng}&end_lat=${end.lat}&end_lon=${end.lng}`;

  console.log(`Requesting route from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    console.log('Route data received:', data);

    if (data.error) {
      console.error('Error in route data:', data.error);
      return;
    }

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }
    routeLayerRef.current = L.layerGroup().addTo(map);

    let hasValidLayers = false;

    if (data.segments && Array.isArray(data.segments)) {
      data.segments.forEach(segment => {
        let latLngs = [];
        let segColor = segment.type === "walking" ? "#af399b" : "#FF0000";

        // Line style options
        let lineOptions = {
          color: segColor,
          weight: 5
        };

        // Add dashArray for walking segments
        if (segment.type === "walking") {
          lineOptions.dashArray = "10, 10";
        }

        if (segment.type === "walking") {
          // Handle walking segments with array coordinates [lat, lng]
          if (Array.isArray(segment.from) && Array.isArray(segment.to) &&
              segment.from.length >= 2 && segment.to.length >= 2) {
            latLngs = [segment.from, segment.to];
          }
          // Object format handling as fallback
          else if (segment.from && segment.to &&
              segment.from.lat && segment.from.lng &&
              segment.to.lat && segment.to.lng) {
            latLngs = [[segment.from.lat, segment.from.lng], [segment.to.lat, segment.to.lng]];
          }
        }
        else if (segment.type === "transport") {
          // Handle transport segments where location is an array [lat, lng]
          if (segment.from_stop && segment.to_stop) {
            const fromLocation = segment.from_stop.location;
            const toLocation = segment.to_stop.location;

            if (Array.isArray(fromLocation) && Array.isArray(toLocation) &&
                fromLocation.length >= 2 && toLocation.length >= 2) {
              latLngs = [fromLocation, toLocation];
            }
            // Object format handling as fallback
            else if (fromLocation && toLocation &&
                fromLocation.lat && fromLocation.lng &&
                toLocation.lat && toLocation.lng) {
              latLngs = [[fromLocation.lat, fromLocation.lng], [toLocation.lat, toLocation.lng]];
            }
          }
          // Check for geometry as another option
          else if (segment.geometry && Array.isArray(segment.geometry)) {
            latLngs = segment.geometry.map(point =>
                Array.isArray(point) ? point : [point.lat, point.lng]);
          }
        }

        if (latLngs.length > 0 && latLngs.every(coord =>
            Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))) {

          // Add the polyline
          L.polyline(latLngs, lineOptions).addTo(routeLayerRef.current);

          // Add circle with route number for transport segments
          if (segment.type === "transport" && segment.route_number) {
            const startPoint = latLngs[0];

            // Create a custom icon with route number
            const routeIcon = L.divIcon({
              html: `<div style="background-color:#FF0000; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${segment.route_number}</div>`,
              className: 'route-number-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            // Add marker with the icon
            L.marker(startPoint, { icon: routeIcon }).addTo(routeLayerRef.current);
          }

          hasValidLayers = true;
        } else {
          console.warn('Invalid coordinates in segment:', segment);
        }
      });

      // Only fit bounds if we have layers
      if (hasValidLayers && routeLayerRef.current.getLayers().length > 0) {
        try {
          map.fitBounds(routeLayerRef.current.getBounds(), {
            paddingTopLeft: [300, 30],
            paddingBottomRight: [30, 30]
          });
        } catch (error) {
          console.error('Error setting map bounds:', error);
        }
      }
    } else if (data.geometry && Array.isArray(data.geometry) && data.geometry.length > 0) {
      // fallback for old geometry
      const latLngs = data.geometry.map(coords => {
        if (Array.isArray(coords) && coords.length >= 2) {
          return [coords[1], coords[0]]; // [lat, lng] from [lng, lat]
        }
        return null;
      }).filter(coord => coord !== null);

      if (latLngs.length > 0) {
        L.polyline(latLngs, { color, weight: 5 }).addTo(routeLayerRef.current);
        try {
          map.fitBounds(routeLayerRef.current.getBounds(), {
            paddingTopLeft: [300, 30],
            paddingBottomRight: [30, 30]
          });
        } catch (error) {
          console.error('Error setting map bounds:', error);
        }
      } else {
        console.error("Invalid geometry data", data.geometry);
      }
    } else {
      console.error("Invalid route data", data);
    }
  } catch (error) {
    console.error('Error fetching route:', error);
  }
};