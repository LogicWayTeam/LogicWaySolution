from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import time
from math import radians, sin, cos, asin, sqrt
import json

class BaseRouteBuilder(ABC):
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
    def __init__(self, type, from_stop, to_stop, transport_type, route_number,
                 way_description, departure_time, arrival_time, stops=None):
        super().__init__(type, from_stop, to_stop)
        self.transport_type = transport_type
        self.route_number = route_number
        self.way_description = way_description
        self.departure_time = departure_time
        self.arrival_time = arrival_time
        self.stops = stops or []
