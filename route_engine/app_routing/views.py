from routingpy import Valhalla
from django.http import JsonResponse

client = Valhalla()

def get_route(request):
    try:
        profile = request.GET.get('profile')
        if not profile:
            profile = 'auto'
        locations_param = request.GET.get('locations')
        if not locations_param:
            return JsonResponse({"error": "Missing 'locations' parameter"}, status=400)

        try:
            locations = [
                list(map(float, pair.split(","))) for pair in locations_param.split(";")
            ]
        except ValueError:
            return JsonResponse({"error": "Invalid 'locations' format"}, status=400)

        route = client.directions(locations=locations, profile=profile)

        return JsonResponse({
            'geometry': route.geometry,
            'duration': route.duration,
            'distance': route.distance,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
