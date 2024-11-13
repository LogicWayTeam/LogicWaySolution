from xml.dom.pulldom import CHARACTERS
from sqlalchemy import Column, String, Boolean, Integer, Date, Time, Float, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Agency(Base):
    __tablename__ = 'agency'
    agency_id = Column(String, primary_key=True)
    agency_name = Column(String)
    agency_url = Column(String)
    agency_timezone = Column(String)
    agency_phone = Column(String)
    agency_lang = Column(String)


class Calendar(Base):
    __tablename__ = 'calendar'
    service_id = Column(String, primary_key=True)
    monday = Column(Boolean)
    tuesday = Column(Boolean)
    wednesday = Column(Boolean)
    thursday = Column(Boolean)
    friday = Column(Boolean)
    saturday = Column(Boolean)
    sunday = Column(Boolean)
    start_date = Column(Date)
    end_date = Column(Date)


class Routes(Base):
    __tablename__ = 'routes'
    route_id = Column(String, primary_key=True)
    agency_id = Column(String, ForeignKey('agency.agency_id'))
    route_short_name = Column(String)
    route_long_name = Column(String)
    route_desc = Column(String)
    route_type = Column(Integer)
    route_color = Column(String)
    route_text_color = Column(String)


class Shapes(Base):
    __tablename__ = 'shapes'
    shape_id = Column(String, primary_key=True)
    shape_pt_lat = Column(Float)
    shape_pt_lon = Column(Float)
    shape_pt_sequence = Column(Integer)


class Stops(Base):
    __tablename__ = 'stops'
    stop_id = Column(String, primary_key=True)
    stop_name = Column(String)
    stop_lat = Column(Float)
    stop_lon = Column(Float)
    zone_id = Column(String)

    def __str__(self):
        return self.stop_name

    def to_dict(self):
        return {
            'stop_id': self.stop_id,
            'stop_name': self.stop_name,
            'stop_lat': self.stop_lat,
            'stop_lon': self.stop_lon,
            'zone_id': self.zone_id,
        }


class StopTimes(Base):
    __tablename__ = 'stop_times'
    trip_id = Column(String)
    arrival_time = Column(Time)
    departure_time = Column(Time)
    stop_id = Column(String)
    stop_sequence = Column(Integer)
    stop_headsign = Column(String)
    pickup_type = Column(String)
    drop_off_type = Column(String)
    __table_args__ = (PrimaryKeyConstraint('trip_id', 'stop_sequence'),)


class Trips(Base):
    __tablename__ = 'trips'
    trip_id = Column(String, primary_key=True)
    route_id = Column(String)
    service_id = Column(String)
    trip_headsign = Column(String)
    direction_id = Column(Integer)
    shape_id = Column(Integer)
    wheelchair_accessible = Column(Integer)
    brigade = Column(Integer)