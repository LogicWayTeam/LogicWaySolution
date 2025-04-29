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

    var lastLMarker = null;
    var lastRMarker = null;
    var routingControl = null;

    autobusRoute();

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

    function autobusRoute() {
        fetch('/api/route/5/1')
            .then(response => response.json())
            .then(stop_names => {
                const stopCoordinates = [];

                const stopPromises = stop_names.map(stop_name => {
                    return fetch('/api/stop/' + stop_name + '/')
                        .then(response => response.json())
                        .then(stop_data => {
                            console.info('Stop data:', stop_data);
                            addStopsToMap([stop_data]);
                            stopCoordinates.push({lat: stop_data.stop_lat, lng: stop_data.stop_lon});
                        })
                        .catch(error => {
                            console.error('Error fetching stop:', error);
                        });
                });

                Promise.all(stopPromises)
                    .then(() => {
                        console.info(stopCoordinates);
                        if (stopCoordinates.length > 0) {
                            buildRoute(stopCoordinates, 'auto', 'blue');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching route:', error);
                    });
            });
    }


    function reverseGeocodeNominatim(lat, lon, callback) {
        var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    callback(data.display_name);
                } else {
                    callback("Address not found");
                }
            })
            .catch(error => {
                console.error("Error during reverse geocoding:", error);
                callback("Error when obtaining an address");
            });
    }

    function reverseGeocodeOverpass(lat, lon, callback) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way(around:50,${lat},${lon})[name];out;`;

        fetch(overpassUrl)
            .then(response => response.json())
            .then(data => {
                if (data.elements.length > 0) {
                    const name = data.elements[0].tags.name;
                    callback(name);
                } else {
                    callback("No nearby roads or places found.");
                }
            })
            .catch(error => callback(error));
    }

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
        const points = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
        const valhallaURL = `${ROUTE_ENGINE_URL}/route/get_route?profile=${profile}&locations=${points}`;

        fetch(valhallaURL)
            .then(response => response.json())
            .then(data => {
                if (data.geometry && data.duration) {
                    const route = data.geometry;
                    const latLngRoute = route.map(point => [point[1], point[0]]);

                    if (routingControl) {
                        map.removeLayer(routingControl);
                    }

                    routingControl = L.polyline(latLngRoute, { color: color, weight: 5 }).addTo(map);

                    map.fitBounds(L.polyline(latLngRoute).getBounds());
                } else {
                    console.error('No valid route data:', data);
                }
            })
            .catch(error => console.error('Error fetching route:', error));
    }


    map.on('click', function (e) {
        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocodeLocal(lat, lon, function (address) {
            if (lastLMarker) {
                map.removeLayer(lastLMarker);
            }

            lastLMarker = L.marker(e.latlng).addTo(map)
                .bindPopup(address)
                .openPopup();

            if (lastLMarker && lastRMarker) {
                buildRoute([lastLMarker.getLatLng(), lastRMarker.getLatLng()], 'pedestrian', 'red');
            }
        });
    });

    map.on('contextmenu', function (e) {
        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocodeLocal(lat, lon, function (address) {
            if (lastRMarker) {
                map.removeLayer(lastRMarker);
            }

            lastRMarker = L.marker(e.latlng).addTo(map)
                .bindPopup(address)
                .openPopup();

            if (lastLMarker && lastRMarker) {
                buildRoute([lastLMarker.getLatLng(), lastRMarker.getLatLng()], 'pedestrian', 'red');
            }
        });
    });

    var redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var geocoder = L.Control.Geocoder.nominatim();
    L.Control.geocoder({
        geocoder: geocoder,
        placeholder: 'Enter address',
        defaultMarkGeocode: false
    }).on('markgeocode', function (e) {
        var latlng = e.geocode.center;
        L.marker(latlng, {icon: redIcon}).addTo(map)
            .bindPopup(e.geocode.name)
            .openPopup();
        map.setView(latlng, 13);
    }).addTo(map);


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
                .bindPopup(`<b>${stopName}</b><br>Lat: ${lat}, Lon: ${lon}`);
        });
    }

    // Function to find the nearest stop to the given
    /*function findNearestStop(lat, lon) {
        let nearestStop = null;
        let minDistance = Infinity;

        stopsData.forEach(stop => {
            let distance = Math.sqrt(Math.pow(lat - stop.stop_lat, 2) + Math.pow(lon - stop.stop_lon, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = stop;
            }
        });

        return nearestStop;
    }*/
}