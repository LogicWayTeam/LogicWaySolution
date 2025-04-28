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

    let startMarker = null;
    let endMarker = null;

    // Add click handlers
    map.on('click', function(e) {
        // Left click sets the start point
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
        startMarker.bindPopup("Start point").openPopup();

        if (startMarker && endMarker) {
            buildTransitRoute(
                [startMarker.getLatLng().lat, startMarker.getLatLng().lng],
                [endMarker.getLatLng().lat, endMarker.getLatLng().lng]
            );
        }
    });

    map.on('contextmenu', function(e) {
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
        endMarker.bindPopup("End point").openPopup();

        if (startMarker && endMarker) {
            buildTransitRoute(
                [startMarker.getLatLng().lat, startMarker.getLatLng().lng],
                [endMarker.getLatLng().lat, endMarker.getLatLng().lng]
            );
        }
    });

    // Add a clear button to reset the route and markers
    var clearButton = L.control({position: 'topright'});
    clearButton.onAdd = function() {
        var div = L.DomUtil.create('div', 'clear-button');
        div.innerHTML = '<button style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">Clear Route</button>';
        div.onclick = function() {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
            startMarker = null;
            endMarker = null;

            if (window.currentRouteLines) {
                window.currentRouteLines.forEach(line => map.removeLayer(line));
                window.currentRouteLines = [];
            }
        };
        return div;
    };
    clearButton.addTo(map);

    function buildTransitRoute(startPoint, endPoint) {
        loadingOverlay.style.display = 'flex';
        const transitURL = `/routing/SimpleGreedySearch?start_lat=${startPoint[0]}&start_lon=${startPoint[1]}&end_lat=${endPoint[0]}&end_lon=${endPoint[1]}`;

        fetch(transitURL)
            .then(response => response.json())
            .then(data => {
                loadingOverlay.style.display = 'none';
                if (data.segments) {
                    if (window.currentRouteLines) {
                        window.currentRouteLines.forEach(line => map.removeLayer(line));
                    }
                    window.currentRouteLines = [];

                    data.segments.forEach(segment => {
                        if (segment.type === "walking") {
                            const walkingLine = L.polyline([
                                segment.from,
                                segment.to
                            ], {
                                color: '#666666',
                                weight: 3,
                                dashArray: '5, 10',
                                opacity: 0.8
                            }).addTo(map);

                            window.currentRouteLines.push(walkingLine);
                        } else if (segment.type === "transport") {
                            // Транспортные участки - сплошная линия с цветом по типу транспорта
                            const transportColor = getTransportColor(segment.transport_type);
                            const transportLine = L.polyline([
                                segment.from_stop.location,
                                segment.to_stop.location
                            ], {
                                color: transportColor,
                                weight: 4,
                                opacity: 0.8
                            }).addTo(map);

                            // Добавляем маркеры остановок
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

                            startMarker.bindPopup(`Остановка: ${segment.from_stop.name}<br>Маршрут: ${segment.route_number}`);
                            endMarker.bindPopup(`Остановка: ${segment.to_stop.name}<br>Маршрут: ${segment.route_number}`);

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
                loadingOverlay.style.display = 'none';
                console.error('Error fetching route:', error)
            });
    }

    function getTransportColor(transportType) {
        const colors = {
            0: '#FF0000', // Трамвай - красный
            1: '#0000FF', // Метро - синий
            2: '#00FF00', // Железная дорога - зеленый
            3: '#FFA500'  // Автобус - оранжевый
        };
        return colors[transportType] || '#808080'; // Серый по умолчанию
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