import pytest
import logging
from logicway.database.database import SessionLocal
from logicway.database.models import Routes
from logicway.database.views import get_route_data, get_stop_data

logger = logging.getLogger(__name__)

def get_test_stop_in_route_data():
    session = SessionLocal()
    test_cases = []

    try:
        routes = session.query(Routes).all()
        for route in routes:
            stops = get_route_data(route.route_id, 0)
            for stop_name in stops:
                test_cases.append((route.route_id, stop_name))
    finally:
        session.close()

    return test_cases

@pytest.mark.parametrize("route_id,stop_name", get_test_stop_in_route_data())
def test_stop_in_route(route_id, stop_name):
    stop_data = get_stop_data(stop_name)
    assert stop_data is not None, f"Stop '{stop_name}' not found in route {route_id}"