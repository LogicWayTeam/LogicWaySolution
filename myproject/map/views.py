import requests
from django.shortcuts import render

def get_coordinates(place_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': place_name,
        'format': 'json',
        'addressdetails': 1,
        'limit': 1
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data:
        return data[0]['lat'], data[0]['lon']
    else:
        return None, None

def map_with_stops_view(request):
    stops = [
        {"name": "Остановка 1", "address": "Świętego Czesława, Górna Wilda, Wilda, Poznan, Greater Poland Voivodeship, 61-575, Poland"},
    ]

    stops_with_coords = []
    for stop in stops:
        lat, lon = get_coordinates(stop["address"])
        if lat and lon:
            stops_with_coords.append({
                "name": stop["name"],
                "lat": lat,
                "lon": lon
            })

    print(stops_with_coords)

    return render(request, 'map/map.html', {'stops': stops_with_coords})
