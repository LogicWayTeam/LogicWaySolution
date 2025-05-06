function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
}

loadScript('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', function () {
    loadScript('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js', function () {
        loadScript("https://unpkg.com/@mapbox/polyline", function () {
            initializeMap();
        });
    });
});

function initializeMap() {
    const poznanCenter = [52.406376, 16.925167];

    let map = L.map('map').setView(poznanCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const loadingOverlay = L.DomUtil.create('div', 'loading-overlay');
    loadingOverlay.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p>Calculating route...</p>
        </div>
    `;
    map._container.appendChild(loadingOverlay);
    loadingOverlay.style.display = 'none';

    let isLoading = false;

    allStops();

    // Add these functions to control the loading state
    function startLoading() {
        isLoading = true;
        loadingOverlay.style.display = 'flex';

        // Disable map dragging and interactions
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        // Optional: Change cursor to indicate loading
        map._container.style.cursor = 'wait';
    }

    function stopLoading() {
        isLoading = false;
        loadingOverlay.style.display = 'none';

        // Re-enable map interactions
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        // Reset cursor
        map._container.style.cursor = '';
    }

    function allStops() {
        fetch('/api/stops/')
            .then(response => response.json())
            .then(data => {
                addStopsToMap(data);
            })
            .catch(error => {
                console.error('Error fetching stops:', error);
            });
    }

    function addStopsToMap(stops) {
        stops.forEach(stop => {
            var lat = stop.stop_lat;
            var lon = stop.stop_lon;
            var stopName = stop.stop_name;

            L.circle([lat, lon], {
                color: '#931050',
                fillColor: '#931050',
                fillOpacity: 0.5,
                radius: 2
            }).addTo(map)
                .bindPopup(`<b>${stopName}</b>`);
        });
    }

    let startMarker = null;
    let endMarker = null;

    // Add click handlers
    map.on('click', function(e) {
        if (isLoading) return;

        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocodeLocal(lat, lon, function (address) {
            // Remove previous start marker if it exists
            if (startMarker) {
                map.removeLayer(startMarker);
            }

            startMarker = L.marker(e.latlng, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);
            startMarker.bindPopup(`Start point: ${address}`).openPopup();

            if (startMarker && endMarker) {
                buildTransitRoute(
                    [startMarker.getLatLng().lat, startMarker.getLatLng().lng],
                    [endMarker.getLatLng().lat, endMarker.getLatLng().lng]
                );
            }
        });
    });

    map.on('contextmenu', function(e) {
        if (isLoading) return;

        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocodeLocal(lat, lon, function (address) {
            if (endMarker) {
                map.removeLayer(endMarker);
            }

            endMarker = L.marker(e.latlng, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);
            endMarker.bindPopup(`End point: ${address}`).openPopup();

            if (startMarker && endMarker) {
                buildTransitRoute(
                    [startMarker.getLatLng().lat, startMarker.getLatLng().lng],
                    [endMarker.getLatLng().lat, endMarker.getLatLng().lng]
                );
            }
        });
    });

    // Add address search control
    var searchControl = L.control({position: 'topright'});
    searchControl.onAdd = function() {
        var container = L.DomUtil.create('div', 'search-container');
        container.style.backgroundColor = 'white';
        container.style.padding = '5px';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        container.style.width = '250px';

        var input = L.DomUtil.create('input', 'search-input', container);
        input.type = 'text';
        input.placeholder = 'Search address...';
        input.style.width = '180px';
        input.style.padding = '5px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        input.style.marginRight = '5px';
        input.style.marginBottom = '5px';

        var button = L.DomUtil.create('button', 'search-button', container);
        button.innerHTML = 'Search';
        button.style.padding = '5px 10px';
        button.style.background = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        // Prevent clicks and scrolls from moving the map
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Set up search functionality
        L.DomEvent.on(button, 'click', function() {
            searchAddress(input.value);
        });

        // Allow hitting Enter to search
        L.DomEvent.on(input, 'keypress', function(e) {
            if (e.keyCode === 13) {
                searchAddress(input.value);
            }
        });

        return container;
    };
    searchControl.addTo(map);

    // Search function that calls the geocode API
    function searchAddress(address) {
        if (!address || isLoading) return;

        startLoading();

        fetch(`${ROUTE_ENGINE_URL}/geocode/geocode?address=${encodeURIComponent(address)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Address not found');
                }
                return response.json();
            })
            .then(data => {
                stopLoading();

                if (data.latitude && data.longitude) {
                    const location = [data.latitude, data.longitude];

                    // Center map on found location
                    map.setView(location, 16);

                    // Add a temporary marker that fades out
                    const searchMarker = L.marker(location, {
                        icon: L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }).addTo(map);

                    searchMarker.bindPopup(`${address}`).openPopup();

                    // Remove marker after 20 seconds
                    setTimeout(() => {
                        map.removeLayer(searchMarker);
                    }, 20000);
                }
            })
            .catch(error => {
                stopLoading();
                alert('Could not find the address: ' + error.message);
                console.error('Geocoding error:', error);
            });
    }

    // Add a clear button to reset the route and markers
    var clearButton = L.control({position: 'topright'});
    clearButton.onAdd = function() {
        if (isLoading) return;
        var div = L.DomUtil.create('div', 'clear-button');
        var button = L.DomUtil.create('button', '', div);
        button.innerHTML = 'Clear Route';
        button.style.padding = '8px';
        button.style.background = 'white';
        button.style.border = '1px solid #ccc';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(button, 'click', function() {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
            startMarker = null;
            endMarker = null;

            if (window.currentRouteLines) {
                window.currentRouteLines.forEach(line => map.removeLayer(line));
                window.currentRouteLines = [];
            }
        });

        return div;
    };
    clearButton.addTo(map);

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

    function buildPrimitiveRoute(stops, profile, format) {
        const points = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
        const valhallaURL = `${ROUTE_ENGINE_URL}/route/get_route?profile=${profile}&locations=${points}`;

        return fetch(valhallaURL)
            .then(response => response.json())
            .then(data => {
                if (data.geometry && data.duration) {
                    const route = data.geometry;
                    const latLngRoute = route.map(point => [point[1], point[0]]);

                    const polyline = L.polyline(latLngRoute, format || {
                        color: '#808080',
                        weight: 5,
                    });

                    return polyline;
                } else {
                    console.error('No valid route data:', data);
                    return null;
                }
            })
            .catch(error => {
                console.error('Error fetching route:', error);
                return null;
            });
    }

    function buildTransitRoute(startPoint, endPoint) {
        startLoading();

        const transitURL = `/routing/SimpleGreedySearch?start_lat=${startPoint[0]}&start_lon=${startPoint[1]}&end_lat=${endPoint[0]}&end_lon=${endPoint[1]}`;

        fetch(transitURL)
            .then(response => response.json())
            .then(data => {
                stopLoading();
                if (data.segments) {
                    if (window.currentRouteLines) {
                        window.currentRouteLines.forEach(line => map.removeLayer(line));
                    }
                    window.currentRouteLines = [];

                    data.segments.forEach(segment => {
                        if (segment.type === "walking") {
                            const stops = [
                                { lng: segment.from[1], lat: segment.from[0] },
                                { lng: segment.to[1], lat: segment.to[0] }
                            ];

                            buildPrimitiveRoute(stops, 'pedestrian', {
                                color: '#af399b',
                                weight: 3,
                                dashArray: '5, 10',
                                opacity: 0.8
                            }).then(walkLine => {
                                if (walkLine) {
                                    walkLine.addTo(map);
                                    window.currentRouteLines.push(walkLine);
                                }
                            });
                        } else if (segment.type === "transport") {
                            const transportColor = getTransportColor(segment.transport_type);
                            const transportLine = L.polyline([
                                segment.from_stop.location,
                                segment.to_stop.location
                            ], {
                                color: transportColor,
                                weight: 4,
                                opacity: 0.8
                            }).addTo(map);

                            const startMarker = L.marker(segment.from_stop.location, {
                                icon: L.divIcon({
                                    className: 'stop-marker',
                                    html: `<div class="stop-icon">${segment.route_number}</div>`,
                                    iconSize: [20, 20]
                                })
                            }).addTo(map);

                            const endMarker = L.marker(segment.to_stop.location, {
                                icon: L.divIcon({
                                    className: 'stop-marker',
                                    html: `<div class="stop-icon">${segment.route_number}</div>`,
                                    iconSize: [20, 20]
                                })
                            }).addTo(map);

                            startMarker.bindPopup(`Stop: ${segment.from_stop.name}<br>Route: ${segment.route_number}`);
                            endMarker.bindPopup(`Stop: ${segment.to_stop.name}<br>Route: ${segment.route_number}`);

                            window.currentRouteLines.push(transportLine, startMarker, endMarker);
                        }
                    });

                    const allPoints = data.segments.flatMap(segment => {
                        if (segment.type === "walking") {
                            return [segment.from, segment.to];
                        } else {
                            return [segment.from_stop.location, segment.to_stop.location];
                        }
                    });
                    map.fitBounds(L.latLngBounds(allPoints));

                } else {
                    console.error('No valid route data:', data);
                }
            })
            .catch(error => {
                stopLoading();
                console.error('Error fetching route:', error)
            });
    }

    function getTransportColor(transportType) {
        const colors = {
            0: '#FF0000', // TRAM
            1: '#0000FF', // SUBWAY
            2: '#00FF00', // TRAIN
            3: '#FFA500' // BUS
        };
        return colors[transportType] || '#808080';
    }

    const styles = `
        .stop-marker {
            background: white;
            border: 2px solid #666;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-weight: bold;
            font-size: 12px;
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.7);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            display: none;
        }
        
        .spinner-container {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            text-align: center;
        }
        
        .spinner {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
}