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

    if response.status_code != 200:
        print(f"Error: status code received {response.status_code}")
        return None

    data = response.json()

    if data:
        return data[0]['lat'], data[0]['lon']
    else:
        return None, None


def map_with_stops_view(request):
    return render(request, 'map/map.html')
