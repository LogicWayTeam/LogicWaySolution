from django.http import JsonResponse
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="django_geocoding")

def geocode_address(request):
    address = request.GET.get('address')
    location = geolocator.geocode(address)

    if location:
        return JsonResponse({
            'latitude': location.latitude,
            'longitude': location.longitude,
        })
    else:
        return JsonResponse({"error": "Not founded"}, status=400)

def reverse_geocode(request):
    lon = request.GET.get('lon')
    lat = request.GET.get('lat')

    if not lon or not lat:
        return JsonResponse({"error": "Missing 'lon' or 'lat' parameter"}, status=400)

    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location:
            return JsonResponse({"address": location.address})
        else:
            return JsonResponse({"error": "Address not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)