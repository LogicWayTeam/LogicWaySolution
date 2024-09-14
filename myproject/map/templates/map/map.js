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

function buildRoute(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
        ],
        routeWhileDragging: true
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
            buildRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng());
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
            buildRoute(lastLMarker.getLatLng(), lastRMarker.getLatLng());
        }
    });
});

var redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', // Изображение цветного маркера
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // Стандартная тень
    iconSize: [25, 41], // Размер иконки
    iconAnchor: [12, 41], // Координаты якоря иконки (для установки на карту)
    popupAnchor: [1, -34], // Координаты якоря для всплывающего окна
    shadowSize: [41, 41]   // Размер тени
});

var geocoder = L.Control.Geocoder.nominatim();
L.Control.geocoder({
    geocoder: geocoder,
    placeholder: 'Введите адрес',
    defaultMarkGeocode: false
}).on('markgeocode', function(e) {
    var latlng = e.geocode.center;
    L.marker(latlng, {icon: redIcon}).addTo(map)
        .bindPopup(e.geocode.name)
        .openPopup();
    map.setView(latlng, 13);
}).addTo(map);