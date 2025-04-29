from sqlalchemy import Column, String, Boolean, Integer, Date, Time, Float, ForeignKey, PrimaryKeyConstraint, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Agency(Base):
    __tablename__ = 'agency'
    agency_id = Column(String, primary_key=True)
    agency_name = Column(String, nullable=False)
    agency_url = Column(String)
    agency_timezone = Column(String, nullable=False)
    agency_phone = Column(String)
    agency_lang = Column(String)

    routes = relationship('Routes', back_populates='agency', cascade='all, delete-orphan')


class Calendar(Base):
    __tablename__ = 'calendar'
    service_id = Column(String, primary_key=True)
    monday = Column(Boolean, default=False)
    tuesday = Column(Boolean, default=False)
    wednesday = Column(Boolean, default=False)
    thursday = Column(Boolean, default=False)
    friday = Column(Boolean, default=False)
    saturday = Column(Boolean, default=False)
    sunday = Column(Boolean, default=False)
    start_date = Column(Date)
    end_date = Column(Date)


class Routes(Base):
    __tablename__ = 'routes'
    route_id = Column(String, primary_key=True)
    agency_id = Column(String, ForeignKey('agency.agency_id', ondelete='CASCADE'), nullable=False)
    route_short_name = Column(String, nullable=False)
    route_long_name = Column(String)
    route_desc = Column(String)
    route_type = Column(Integer)
    route_color = Column(String)
    route_text_color = Column(String)

    agency = relationship('Agency', back_populates='routes')

    # Индекс на foreign key
    __table_args__ = (
        Index('ix_routes_agency_id', 'agency_id'),
    )


class Shapes(Base):
    __tablename__ = 'shapes'
    shape_id = Column(String, primary_key=True)
    shape_pt_lat = Column(Float)
    shape_pt_lon = Column(Float)
    shape_pt_sequence = Column(Integer)


class Stops(Base):
    __tablename__ = 'stops'
    stop_id = Column(String, primary_key=True)
    stop_name = Column(String, nullable=False)
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
    trip_id = Column(String, ForeignKey('trips.trip_id', ondelete='CASCADE'), nullable=False)
    arrival_time = Column(Time)
    departure_time = Column(Time)
    stop_id = Column(String, ForeignKey('stops.stop_id', ondelete='CASCADE'), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    stop_headsign = Column(String)
    pickup_type = Column(String)
    drop_off_type = Column(String)
    __table_args__ = (PrimaryKeyConstraint('trip_id', 'stop_sequence'),)

    trip = relationship('Trips', back_populates='stop_times')
    stop = relationship('Stops')


class Trips(Base):
    __tablename__ = 'trips'
    trip_id = Column(String, primary_key=True)
    route_id = Column(String, ForeignKey('routes.route_id', ondelete='CASCADE'), nullable=False)
    service_id = Column(String, ForeignKey('calendar.service_id', ondelete='CASCADE'), nullable=False)
    trip_headsign = Column(String)
    direction_id = Column(Integer)
    shape_id = Column(Integer)
    wheelchair_accessible = Column(Integer)
    brigade = Column(Integer)

    route = relationship('Routes')
    service = relationship('Calendar')
    stop_times = relationship('StopTimes', back_populates='trip', cascade='all, delete-orphan')

