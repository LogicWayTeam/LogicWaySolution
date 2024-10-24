import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponseBadRequest


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


def graphhopper_proxy(request):
    graphhopper_url = 'https://logicway.taile241c6.ts.net:8989/route'

    point1 = request.GET.get('point', None)
    point2 = request.GET.getlist('point', None)
    profile = request.GET.get('profile', 'car')

    if not point1 or not point2:
        return HttpResponseBadRequest('Missing required parameters: point')

    params = {
        'point': [point1] + point2,
        'profile': profile
    }

    try:
        response = requests.get(graphhopper_url, params=params, verify=False)
        response.raise_for_status()

        return JsonResponse(response.json())

    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)


def map_with_stops_view(request):
    return render(request, 'map/map.html')
