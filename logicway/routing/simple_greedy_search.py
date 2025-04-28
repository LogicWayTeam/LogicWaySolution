from database.database import SessionLocal
from database.models import Stops, Routes, StopTimes, Trips
from sqlalchemy.orm import aliased
from .typedef import (BaseRouteBuilder,
    Point, RouteSegment, TransportSegment)
from database.views import get_route, get_stop
import os
from dotenv import load_dotenv
import requests
import json
from django.http import HttpRequest, QueryDict

load_dotenv()
ROUTE_ENGINE_URL = os.getenv('ROUTE_ENGINE_URL')


class SimpleGreedySearch(BaseRouteBuilder):
    def __init__(self, max_walking_distance=3):
        self.db = SessionLocal()
        self.MAX_WALKING_DISTANCE = max_walking_distance  # km

    def find_nearby_stops(self, lat, lon, max_distance):
        stops = self.db.query(Stops).all()
        nearby = []

        for stop in stops:
            distance = self.haversine_distance(lat, lon, stop.stop_lat, stop.stop_lon)
            if distance <= max_distance:
                nearby.append((stop, distance))

        return sorted(nearby, key=lambda x: x[1])

    def find_route_between_stops(self, from_stop, to_stop):
        aliased_stop_times = aliased(StopTimes)

        trip_query = self.db.query(
            Routes.route_id,
            Routes.route_type,
            Routes.route_short_name,
            StopTimes.departure_time,
            aliased_stop_times.arrival_time
        ).join(
            Trips, Routes.route_id == Trips.route_id
        ).join(
            StopTimes, Trips.trip_id == StopTimes.trip_id
        ).filter(
            StopTimes.stop_id == from_stop.stop_id
        ).join(
            aliased_stop_times, Trips.trip_id == aliased_stop_times.trip_id
        ).filter(
            aliased_stop_times.stop_id == to_stop.stop_id,
            aliased_stop_times.stop_sequence > StopTimes.stop_sequence
        ).first()

        if not trip_query:
            return None

        route_id, route_type, route_number, departure_time, arrival_time = trip_query

        from_point = Point(
            lat=from_stop.stop_lat,
            lon=from_stop.stop_lon,
            name=from_stop.stop_name
        )
        to_point = Point(
            lat=to_stop.stop_lat,
            lon=to_stop.stop_lon,
            name=to_stop.stop_name
        )

        direction = 0
        dummy_request = HttpRequest()
        dummy_request.method = 'GET'
        dummy_request.GET = QueryDict('', mutable=True)
        dummy_request.GET.update({
            'route_id': route_id,
            'direction': direction,
        })

        route_stops_response = get_route(dummy_request, route_id, direction)
        route_stops = json.loads(route_stops_response.content)

        print(route_id)
        print(from_stop.stop_name, to_stop.stop_name)
        print(route_stops)

        start_index = route_stops.index(from_stop.stop_name)
        end_index = route_stops.index(to_stop.stop_name)

        if start_index <= end_index:
            intermediate_stops_names = route_stops[start_index:end_index + 1]
        else:
            direction = 1
            intermediate_stops_names = route_stops[end_index:start_index + 1][::-1]

        stop_points = []
        for stop_name in intermediate_stops_names:
            dummy_request.GET.update({
                'stop_name': stop_name
            })
            stop = get_stop(dummy_request, stop_name)
            stop_points.append(Point(
                lat=stop.stop_lat,
                lon=stop.stop_lon,
                name=stop.stop_name
            ))

        points = ','.join([f'{stop.lat},{stop.lon}' for stop in stop_points])

        response = requests.get(f'{ROUTE_ENGINE_URL}/route/get_route?profile=$car&locations=${points}')

        return TransportSegment(
            type='transport',
            from_stop=from_point,
            to_stop=to_point,
            transport_type=route_type,
            route_number=route_number,
            direction=direction,
            way_description=response.json(),
            departure_time=departure_time,
            arrival_time=arrival_time
        )


    def build_route(self, start_lat, start_lon, end_lat, end_lon):
        segments = []

        start_stops = self.find_nearby_stops(start_lat, start_lon, self.MAX_WALKING_DISTANCE)
        end_stops = self.find_nearby_stops(end_lat, end_lon, self.MAX_WALKING_DISTANCE)

        if not start_stops or not end_stops:
            return [RouteSegment(
                type='walking',
                from_stop=Point(lat=start_lat, lon=start_lon),
                to_stop=Point(lat=end_lat, lon=end_lon)
            )]

        start_stop = start_stops[0][0]
        segments.append(RouteSegment(
            type='walking',
            from_stop=Point(lat=start_lat, lon=start_lon),
            to_stop=Point(lat=start_stop.stop_lat, lon=start_stop.stop_lon)
        ))

        for start_stop, _ in start_stops:
            for end_stop, _ in end_stops:
                route = self.find_route_between_stops(start_stop, end_stop)
                if route:
                    segments.append(route)
                    segments.append(RouteSegment(
                        type='walking',
                        from_stop=Point(lat=end_stop.stop_lat, lon=end_stop.stop_lon),
                        to_stop=Point(lat=end_lat, lon=end_lon)
                    ))
                    return segments

        return [RouteSegment(
            type='walking',
            from_stop=Point(lat=start_lat, lon=start_lon),
            to_stop=Point(lat=end_lat, lon=end_lon)
        )]

    def __del__(self):
        self.db.close()