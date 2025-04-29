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


def get_stop_data(stop_name):
    session = SessionLocal()

    try:
        stop = session.query(Stops).filter(Stops.stop_name.ilike(f"%{stop_name}%")).first()

        if stop:
            stop_data = stop.to_dict()
            return stop_data
        else:
            return None
    finally:
        session.close()


def get_stop(request, stop_name):
    stop_data = get_stop_data(stop_name)
    if stop_data:
        return JsonResponse(stop_data, safe=False)
    else:
        return JsonResponse({'error': 'Stop not found'}, status=404)


def clean_string(text):
    text = re.sub(r'\^[A-Z]', '', text)
    text = re.sub(r'\s{2,}', ' ', text)

    #text = re.sub(r'[^\w\s\-:]', '', text)


    text = ' '.join([word.lower().capitalize() for word in text.split(' ')])

    return text


def get_route_data(route_id, direction):
    with SessionLocal() as session:
        try:
            route = session.query(Routes).get(route_id)
            route_desc = route.route_desc.split('|')[direction > 0 if 1 else 0]

            f1_clean_route_desc = clean_string(route_desc)

            cleaned_route_desc_arr = f1_clean_route_desc.split(' - ')

            return cleaned_route_desc_arr
        except Exception as e:
            return None


def get_route(request, route_id, direction):
    route_stops_name = get_route_data(route_id, direction)
    if not route_stops_name:
        return JsonResponse(
            route_stops_name,
            safe=False,
            json_dumps_params={'ensure_ascii': False}
        )
    else:
        return JsonResponse({'error': 'Route description not found.'}, status=500)
