from database.database import SessionLocal
from database.models import Stops, Routes, StopTimes, Trips
from sqlalchemy.orm import aliased
from .typedef import (BaseRouteBuilder,
    Point, RouteSegment, TransportSegment)
import concurrent.futures
from functools import partial

class SimpleGreedySearch(BaseRouteBuilder):
    def __init__(self, max_walking_distance=1, timeout=60):
        self.db = SessionLocal()
        self.MAX_WALKING_DISTANCE = max_walking_distance  # km
        self.TIMEOUT = timeout # seconds

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

        query = self.db.query(
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

        if query:
            route_id, route_type, route_number, departure_time, arrival_time = query

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

            return TransportSegment(
                type='transport',
                from_stop=from_point,
                to_stop=to_point,
                transport_type=route_type,
                route_number=route_number,
                departure_time=departure_time,
                arrival_time=arrival_time
            )

        return None

    def _build_route_internal(self, start_lat, start_lon, end_lat, end_lon):
        segments = []
        start_stops = self.find_nearby_stops(start_lat, start_lon, self.MAX_WALKING_DISTANCE)
        end_stops = self.find_nearby_stops(end_lat, end_lon, self.MAX_WALKING_DISTANCE)

        if not start_stops or not end_stops:
            return self.get_walking_route(start_lat, start_lon, end_lat, end_lon)

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

        return self.get_walking_route(start_lat, start_lon, end_lat, end_lon)

    def build_route(self, start_lat, start_lon, end_lat, end_lon):
        """Wrapper that calls the internal route builder with a timeout"""
        try:
            # Create a partial function with the arguments
            build_func = partial(self._build_route_internal, start_lat, start_lon, end_lat, end_lon)

            # Run with timeout
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(build_func)
                return future.result(timeout=self.TIMEOUT)

        except concurrent.futures.TimeoutError:
            print(f"Route calculation timed out after {self.TIMEOUT} seconds, returning walking route")
            return self.get_walking_route(start_lat, start_lon, end_lat, end_lon)
        except Exception as e:
            print(f"Error in route calculation: {e}")
            return self.get_walking_route(start_lat, start_lon, end_lat, end_lon)

    def __del__(self):
        self.db.close()