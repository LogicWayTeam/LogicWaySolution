from .database import SessionLocal
from .models import Stops, Routes
from django.http import JsonResponse
import re


def get_stops(request):
    session = SessionLocal()

    try:
        stops = session.query(Stops).all()
        stops_list = [
            {
                'stop_id': stop.stop_id,
                'stop_name': stop.stop_name,
                'stop_lat': stop.stop_lat,
                'stop_lon': stop.stop_lon,
                'zone_id': stop.zone_id
            }
            for stop in stops
        ]
        return JsonResponse(stops_list, safe=False)
    finally:
        session.close()


def get_stop(request, stop_name):
    session = SessionLocal()

    try:
        stop = session.query(Stops).filter(Stops.stop_name.ilike(f"%{stop_name}%")).first()

        if stop:
            stop_data = stop.to_dict()
            return JsonResponse(stop_data, safe=False)
        else:
            return JsonResponse({'error': 'Stop not found'}, status=404)
    finally:
        session.close()


def get_route(request, route_id):
    session = SessionLocal()

    try:
        route = session.query(Routes).get(route_id)
        route_desc = route.route_desc

        route_desc_arr = route_desc.split(' - ')

        print(route_desc_arr)

        for i in range(len(route_desc_arr)):
            route_desc_arr[i] = re.sub(r'\^[A-Z]', '', route_desc_arr[i])
            route_desc_arr[i] = re.sub(r'\b[a-ząćęłńóśźż]+\b', '', route_desc_arr[i])
            route_desc_arr[i] = re.sub(r'\s{2,}', ' ', route_desc_arr[i])

        return JsonResponse(route_desc_arr, safe=False)
    finally:
        session.close()
