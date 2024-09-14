//createRoute('foot');   // Пешком
//createRoute('car');    // На машине
//createRoute('bike');   // На велосипеде

var poznanCenter = [52.406376, 16.925167];

var map = L.map('map').setView(poznanCenter, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var lastLMarker = null;
var lastRMarker = null;
var routingControl = null;

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

function buildRoute(start, end, transportMode) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1/' + transportMode
        }),
        lineOptions: {
            styles: [{ color: 'blue', weight: 4 }]
        }
    }).addTo(map);
}

map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lon = e.latlng.lng;

    reverseGeocode(lat, lon, function(address) {
        if (lastLMarker) {
            map.removeLayer(lastLMarker);
        }

        lastLMarker = L.marker(e.latlng).addTo(map)
            .bindPopup(address)
            .openPopup();

        if (lastLMarker && lastRMarker) {
            buildRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng(), 'car');
        }
    });
});

map.on('contextmenu', function(e) {
    var lat = e.latlng.lat;
    var lon = e.latlng.lng;

    reverseGeocode(lat, lon, function(address) {
        if (lastRMarker) {
            map.removeLayer(lastRMarker);
        }

        lastRMarker = L.marker(e.latlng).addTo(map)
            .bindPopup(address)
            .openPopup();

        if (lastLMarker && lastRMarker) {
            buildRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng(), 'car');
        }
    });
});
