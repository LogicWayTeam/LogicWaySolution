import { LOGICWAY_URL, ROUTE_ENGINE_URL } from './config';
import L from 'leaflet';

export const buildRoute = async (map, stops, routeLayerRef, color = '#c40035', abortSignal) => {
  if (!stops || stops.length < 2) {
    console.error('At least two stops are required to build a route.');
    return;
  }

  const start = stops[0];
  const end = stops[stops.length - 1];
  const url = `${LOGICWAY_URL}/routing/SimpleGreedySearch?start_lat=${start.lat}&start_lon=${start.lng}&end_lat=${end.lat}&end_lon=${end.lng}`;

  console.log(`Requesting route from: ${url}`);

  try {
    const response = await fetch(url, { signal: abortSignal });
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
      for (const segment of data.segments) {
        let latLngs = [];
        let segColor = segment.type === "walking" ? "#af399b" : "#FF0000";
        let lineOptions = {
          color: segColor,
          weight: 5
        };

        if (segment.type === "walking") {
          lineOptions.dashArray = "10, 10";
          let from, to;

          if (Array.isArray(segment.from) && Array.isArray(segment.to)) {
            from = segment.from;
            to = segment.to;
          } else if (segment.from && segment.to) {
            from = [segment.from.lat, segment.from.lng];
            to = [segment.to.lat, segment.to.lng];
          }

          if (from && to) {
            try {
              const points = `${from[0]},${from[1]};${to[0]},${to[1]}`;
              const walkingUrl = `${ROUTE_ENGINE_URL}/route/get_route?profile=pedestrian&locations=${points}`;
              console.log(`Requesting pedestrian route: ${walkingUrl}`);
              const walkResponse = await fetch(walkingUrl, { signal: abortSignal });

              if (walkResponse.ok) {
                const walkData = await walkResponse.json();
                if (walkData && walkData.geometry && Array.isArray(walkData.geometry)) {
                  latLngs = walkData.geometry.map(point =>
                      Array.isArray(point) ? point : [point.lat, point.lng]
                  );
                } else {
                  latLngs = [from, to];
                }
              } else {
                latLngs = [from, to];
              }
            } catch (error) {
              if (error.name === 'AbortError') {
                console.log('Pedestrian route request aborted.');
                return;
              }
              console.error('Error fetching pedestrian route:', error);
              latLngs = [from, to];
            }
          }
        } else if (segment.type === "transport") {
          if (segment.from_stop && segment.to_stop) {
            const fromLocation = segment.from_stop.location;
            const toLocation = segment.to_stop.location;

            if (Array.isArray(fromLocation) && Array.isArray(toLocation) &&
                fromLocation.length >= 2 && toLocation.length >= 2) {
              latLngs = [fromLocation, toLocation];
            } else if (fromLocation && toLocation &&
                fromLocation.lat && fromLocation.lng &&
                toLocation.lat && toLocation.lng) {
              latLngs = [[fromLocation.lat, fromLocation.lng], [toLocation.lat, toLocation.lng]];
            }
          } else if (segment.geometry && Array.isArray(segment.geometry)) {
            latLngs = segment.geometry.map(point =>
                Array.isArray(point) ? point : [point.lat, point.lng]
            );
          }
        }

        if (latLngs.length > 0 && latLngs.every(coord =>
            Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))) {
          L.polyline(latLngs, lineOptions).addTo(routeLayerRef.current);
          if (segment.type === "transport" && segment.route_number) {
            const startPoint = latLngs[0];
            const endPoint = latLngs[1];
            const routeIcon = L.divIcon({
              html: `<div style="background-color:#FF0000; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${segment.route_number}</div>`,
              className: 'route-number-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            L.marker(startPoint, { icon: routeIcon }).addTo(routeLayerRef.current);
            L.marker(endPoint, { icon: routeIcon }).addTo(routeLayerRef.current);
          }
          hasValidLayers = true;
        } else {
          console.warn('Invalid coordinates in segment:', segment);
        }
      }

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
      const latLngs = data.geometry.map(coords => {
        if (Array.isArray(coords) && coords.length >= 2) {
          return [coords[1], coords[0]];
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
    if (error.name === 'AbortError') {
      console.warn('Route request was aborted.');
      return;
    }
    console.error('Error fetching route:', error);
  }
};