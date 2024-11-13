import pytest
import datetime
import os
import django
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from logicway.database.models import Base, Agency, Calendar, Routes, Shapes, Stops, StopTimes, Trips
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logicway.logicway.settings')
django.setup()

load_dotenv()

DATABASE_URL = (
    f"postgresql://{settings.DATABASES['default']['USER']}:"
    f"{settings.DATABASES['default']['PASSWORD']}@"
    f"{settings.DATABASES['default']['HOST']}/{settings.DATABASES['default']['NAME']}"
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


def test_agency_model(db_session):
    agency = Agency(
        agency_id="A1",
        agency_name="Test Agency",
        agency_url="http://test.com",
        agency_timezone="UTC",
        agency_phone="1234567890",
        agency_lang="en"
    )
    db_session.add(agency)
    db_session.commit()

    fetched_agency = db_session.query(Agency).filter_by(agency_id="A1").one()
    assert fetched_agency.agency_name == "Test Agency"
    assert fetched_agency.agency_lang == "en"


def test_calendar_model(db_session):
    calendar = Calendar(
        service_id="S1",
        monday=True,
        tuesday=True,
        wednesday=True,
        thursday=True,
        friday=True,
        saturday=False,
        sunday=False,
        start_date="2023-01-01",
        end_date="2023-12-31"
    )
    db_session.add(calendar)
    db_session.commit()

    fetched_calendar = db_session.query(Calendar).filter_by(service_id="S1").one()
    assert fetched_calendar.monday is True
    assert fetched_calendar.saturday is False


def test_routes_model(db_session):
    route = Routes(
        route_id="R1",
        agency_id="A1",
        route_short_name="101",
        route_long_name="Downtown",
        route_desc="Main route",
        route_type=1,
        route_color="FFFFFF",
        route_text_color="000000"
    )
    db_session.add(route)
    db_session.commit()

    fetched_route = db_session.query(Routes).filter_by(route_id="R1").one()
    assert fetched_route.route_short_name == "101"
    assert fetched_route.route_color == "FFFFFF"


def test_shapes_model(db_session):
    shape = Shapes(
        shape_id="S1",
        shape_pt_lat=50.0,
        shape_pt_lon=20.0,
        shape_pt_sequence=1
    )
    db_session.add(shape)
    db_session.commit()

    fetched_shape = db_session.query(Shapes).filter_by(shape_id="S1").one()
    assert fetched_shape.shape_pt_sequence == 1


def test_stops_model(db_session):
    stop = Stops(
        stop_id="Stop1",
        stop_name="Main Street",
        stop_lat=52.5,
        stop_lon=13.4,
        zone_id="Zone1"
    )
    db_session.add(stop)
    db_session.commit()

    fetched_stop = db_session.query(Stops).filter_by(stop_id="Stop1").one()
    assert fetched_stop.stop_name == "Main Street"
    assert fetched_stop.zone_id == "Zone1"


def test_stop_times_model(db_session):
    stop_time = StopTimes(
        trip_id="Trip1",
        arrival_time=datetime.time(8, 0),
        departure_time=datetime.time(8, 5),
        stop_id="Stop1",
        stop_sequence=1,
        stop_headsign="Northbound",
        pickup_type="regular",
        drop_off_type="regular"
    )
    db_session.add(stop_time)
    db_session.commit()

    fetched_stop_time = db_session.query(StopTimes).filter_by(trip_id="Trip1", stop_sequence=1).one()
    assert fetched_stop_time.arrival_time == datetime.time(8, 0)


def test_trips_model(db_session):
    trip = Trips(
        trip_id="Trip1",
        route_id="R1",
        service_id="S1",
        trip_headsign="Northbound",
        direction_id=1
    )
    db_session.add(trip)
    db_session.commit()

    fetched_trip = db_session.query(Trips).filter_by(trip_id="Trip1").one()
    assert fetched_trip.trip_headsign == "Northbound"
