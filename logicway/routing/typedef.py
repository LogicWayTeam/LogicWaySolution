from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import time
from math import radians, sin, cos, asin, sqrt

class BaseRouteBuilder(ABC):
    @staticmethod
    def get_walking_route(start_lat, start_lon, end_lat, end_lon):
        return [RouteSegment(
            type='walking',
            from_stop=Point(lat=start_lat, lon=start_lon),
            to_stop=Point(lat=end_lat, lon=end_lon)
        )]

    def haversine_distance(self, lat1, lon1, lat2, lon2): #km
        earth_radius = 6371 # km
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        a = sin((lat2 - lat1)/2)**2 + cos(lat1) * cos(lat2) * sin((lon2 - lon1)/2)**2
        c = 2 * asin(sqrt(a))
        return earth_radius * c

    @abstractmethod
    def build_route(self, start_lat, start_lon, end_lat, end_lon):
        pass

@dataclass
class Point:
    lat: float
    lon: float
    name: str = None

@dataclass
class RouteSegment:
    type: str
    from_stop: Point
    to_stop: Point

@dataclass
class TransportSegment(RouteSegment):
    transport_type: int
    route_number: str
    departure_time: time = None
    arrival_time: time = None
