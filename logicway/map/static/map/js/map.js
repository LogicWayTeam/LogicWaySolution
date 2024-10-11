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
        initializeMap();
    });
});

function initializeMap() {
    const poznanCenter = [52.406376, 16.925167];

    // TODO : Normalise map zooming
    let map = L.map('map').setView(poznanCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var lastLMarker = null;
    var lastRMarker = null;
    var routingControl = null;


    fetch('/api/route/3/')
        .then(response => response.json())
        .then(stop_names => {
            const stopCoordinates = [];

            const stopPromises = stop_names.map(stop_name => {
                return fetch('/api/stop/' + stop_name + '/')
                    .then(response => response.json())
                    .then(stop_data => {
                        console.info('Stop data:', stop_data);
                        addStopsToMap([stop_data]);
                        stopCoordinates.push(stop_data);
                    })
                    .catch(error => {
                        console.error('Error fetching stop:', error);
                    });
            });

            Promise.all(stopPromises)
                .then(() => {
                    console.info(stopCoordinates);
                    if (stopCoordinates.length > 0) {
                        buildCarRoute(stopCoordinates);
                    }
                })
                .catch(error => {
                    console.error('Error fetching route:', error);
                });
        });


    function reverseGeocode(lat, lon, callback) {
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

    function buildFoodRoute(start, end) {
        // TODO : Make local graphhopper server
        const ghAPIKey = 'fd0d546d-25c1-4c67-a080-f62fbb384699';
        const ghURL = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=foot&locale=en&key=${ghAPIKey}&points_encoded=false`;

        fetch(ghURL)
            .then(response => response.json())
            .then(data => {
                const route = data.paths[0].points.coordinates;

                const latLngRoute = route.map(point => [point[1], point[0]]);

                if (routingControl) {
                    map.removeLayer(routingControl);
                }

                routingControl = L.polyline(latLngRoute, {color: 'blue', weight: 5}).addTo(map);

                L.marker(startPoint).addTo(map).bindPopup('Start Point').openPopup();
                L.marker(endPoint).addTo(map).bindPopup('End Point').openPopup();

                map.fitBounds(L.polyline(latLngRoute).getBounds());
            })
            .catch(error => console.error('Error fetching route:', error));
    }

    function buildCarRoute(stops) {
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const waypoints = stops.map(stop => L.latLng(stop.lat, stop.lng));

        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true
        }).addTo(map);
    }

    map.on('click', function (e) {
        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocode(lat, lon, function (address) {
            if (lastLMarker) {
                map.removeLayer(lastLMarker);
            }

            lastLMarker = L.marker(e.latlng).addTo(map)
                .bindPopup(address)
                .openPopup();

            if (lastLMarker && lastRMarker) {
                buildFoodRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng());
            }
        });
    });

    map.on('contextmenu', function (e) {
        var lat = e.latlng.lat;
        var lon = e.latlng.lng;

        reverseGeocode(lat, lon, function (address) {
            if (lastRMarker) {
                map.removeLayer(lastRMarker);
            }

            lastRMarker = L.marker(e.latlng).addTo(map)
                .bindPopup(address)
                .openPopup();

            if (lastLMarker && lastRMarker) {
                buildFoodRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng());
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
                color: 'blue',
                fillColor: '#30a3dc',
                fillOpacity: 0.5,
                radius: 2
            }).addTo(map)
                .bindPopup(`<b>${stopName}</b><br>Lat: ${lat}, Lon: ${lon}`);
        });
    }

    function addStopsToMap(stops) {
        stops.forEach(stop => {
            var lat = stop.stop_lat;
            var lon = stop.stop_lon;
            var stopName = stop.stop_name;

            L.circle([lat, lon], {
                color: 'blue',
                fillColor: '#30a3dc',
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