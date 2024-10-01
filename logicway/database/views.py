from .database import SessionLocal
from .models import Stops
from django.http import JsonResponse


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
