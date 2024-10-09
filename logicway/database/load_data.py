import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect
from models import Base, Agency, Calendar, Routes, Shapes, Stops, StopTimes, Trips
from tqdm import tqdm
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')

DATABASE_URL = f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
engine = create_engine(DATABASE_URL)
Session = scoped_session(sessionmaker(bind=engine))

Base.metadata.create_all(engine)

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, 'data', 'ZTMPoznanGTFS')

agency_file = os.path.join(data_dir, 'agency.txt')
calendar_file = os.path.join(data_dir, 'calendar.txt')
routes_file = os.path.join(data_dir, 'routes.txt')
shapes_file = os.path.join(data_dir, 'shapes.txt')
stops_file = os.path.join(data_dir, 'stops.txt')
stop_times_file = os.path.join(data_dir, 'stop_times.txt')
trips_file = os.path.join(data_dir, 'trips.txt')

dtype_mappings = {
    agency_file: {
        'agency_id': str,
        'agency_name': str,
        'agency_url': str,
        'agency_timezone': str,
        'agency_phone': str,
        'agency_lang': str
    },
    calendar_file: {
        'service_id': str,
        'monday': int,
        'tuesday': int,
        'wednesday': int,
        'thursday': int,
        'friday': int,
        'saturday': int,
        'sunday': int,
        'start_date': str,
        'end_date': str
    },
    routes_file: {
        'route_id': str,
        'agency_id': str,
        'route_short_name': str,
        'route_long_name': str,
        'route_desc': str,
        'route_type': int,
        'route_color': str,
        'route_text_color': str
    },
    shapes_file: {
        'shape_id': str,
        'shape_pt_lat': float,
        'shape_pt_lon': float,
        'shape_pt_sequence': int
    },
    stops_file: {
        'stop_id': str,
        'stop_name': str,
        'stop_lat': float,
        'stop_lon': float,
        'zone_id': str
    },
    stop_times_file: {
        'trip_id': str,
        'arrival_time': str,
        'departure_time': str,
        'stop_id': str,
        'stop_sequence': int
    },
    trips_file: {
        'trip_id': str,
        'route_id': str,
        'service_id': str,
        'trip_headsign': str,
        'direction_id': str
    }
}


def read_csv_with_types(file_path, dtype_mapping, date_columns=[]):
    df = pd.read_csv(file_path, dtype=dtype_mapping)
    for date_column in date_columns:
        df[date_column] = pd.to_datetime(df[date_column], format='%Y%m%d').dt.date
    #print(f"Data sample from {file_path}:")
    #print(df.head())
    return df


agency_data = read_csv_with_types(agency_file, dtype_mappings[agency_file])
calendar_data = read_csv_with_types(calendar_file, dtype_mappings[calendar_file],
                                    date_columns=['start_date', 'end_date'])
routes_data = read_csv_with_types(routes_file, dtype_mappings[routes_file])
shapes_data = read_csv_with_types(shapes_file, dtype_mappings[shapes_file])
stops_data = read_csv_with_types(stops_file, dtype_mappings[stops_file])
stop_times_data = read_csv_with_types(stop_times_file, dtype_mappings[stop_times_file])
trips_data = read_csv_with_types(trips_file, dtype_mappings[trips_file])


def remove_duplicates(df, unique_columns):
    return df.drop_duplicates(subset=unique_columns)


shapes_data = remove_duplicates(shapes_data, ['shape_id'])


def safe_convert_time(time_str):
    try:
        hours, minutes, seconds = map(int, time_str.split(':'))
        if hours >= 24:
            hours -= 24
        corrected_time_str = f"{hours:02}:{minutes:02}:{seconds:02}"
        return datetime.strptime(corrected_time_str, '%H:%M:%S').time()
    except ValueError:
        #print(f"Warning: time data '{time_str}' is invalid")
        return None


def get_existing_ids(session, model_class, id_column_name):
    inspector = inspect(model_class)
    primary_key_column = inspector.primary_key[0]
    if not primary_key_column.name == id_column_name:
        raise ValueError("The id_column_name does not match the primary key column name of the model class")

    existing_ids = session.query(getattr(model_class, id_column_name)).all()
    existing_ids = {str(id_tuple[0]) for id_tuple in existing_ids}
    return existing_ids


def insert_data_bulk(data, model_class, session, message, column_mapping=None, batch_size=1000):
    #print(f"Starting to load: {message}")
    objects = []

    if column_mapping:
        id_column_name = list(column_mapping.values())[0]
        existing_ids = get_existing_ids(session, model_class, id_column_name)
    else:
        existing_ids = set()

    for index, row in tqdm(data.iterrows(), total=len(data), desc=message):
        kwargs = {}
        if column_mapping:
            for csv_col, model_attr in column_mapping.items():
                if csv_col in row:
                    value = row[csv_col]
                    if model_attr.endswith('_id') and not pd.isna(value):
                        value = str(value)
                    if isinstance(value, str) and value.isspace():
                        value = None
                    kwargs[model_attr] = value
        else:
            kwargs = row.to_dict()
            for key in kwargs:
                if key.endswith('_id') and not pd.isna(kwargs[key]):
                    kwargs[key] = str(kwargs[key])
                if isinstance(kwargs[key], str) and kwargs[key].isspace():
                    kwargs[key] = None

        if 'arrival_time' in kwargs and isinstance(kwargs['arrival_time'], str):
            kwargs['arrival_time'] = safe_convert_time(kwargs['arrival_time'])
        if 'departure_time' in kwargs and isinstance(kwargs['departure_time'], str):
            kwargs['departure_time'] = safe_convert_time(kwargs['departure_time'])

        #print(f"Data to insert for {model_class.__name__}: {kwargs}")

        if column_mapping and kwargs[id_column_name] in existing_ids:
            continue

        obj = model_class(**kwargs)
        objects.append(obj)

        if len(objects) >= batch_size:
            try:
                session.bulk_save_objects(objects)
                session.flush()
                objects = []
            except SQLAlchemyError as e:
                print(f"Error adding objects: {e}")
                session.rollback()
                break

    if objects:
        try:
            session.bulk_save_objects(objects)
            session.flush()
        except SQLAlchemyError as e:
            print(f"Error adding remaining objects: {e}")
            session.rollback()
    print("Finished")


routes_mapping = {
    'route_id': 'route_id',
    'agency_id': 'agency_id',
    'route_short_name': 'route_short_name',
    'route_long_name': 'route_long_name',
    'route_desc': 'route_desc',
    'route_type': 'route_type',
    'route_color': 'route_color',
    'route_text_color': 'route_text_color'
}

stops_mapping = {
    'stop_id': 'stop_id',
    'stop_name': 'stop_name',
    'stop_lat': 'stop_lat',
    'stop_lon': 'stop_lon',
    'zone_id': 'zone_id'
}

stop_times_mapping = {
    'trip_id': 'trip_id',
    'arrival_time': 'arrival_time',
    'departure_time': 'departure_time',
    'stop_id': 'stop_id',
    'stop_sequence': 'stop_sequence'
}

trips_mapping = {
    'trip_id': 'trip_id',
    'route_id': 'route_id',
    'service_id': 'service_id',
    'trip_headsign': 'trip_headsign',
    'direction_id': 'direction_id'
}

with Session() as session:
    try:
        insert_data_bulk(agency_data, Agency, session, "Agencies", column_mapping={'agency_id': 'agency_id'})
        insert_data_bulk(calendar_data, Calendar, session, "Calendar")
        insert_data_bulk(routes_data, Routes, session, "Routes", column_mapping=routes_mapping)
        insert_data_bulk(shapes_data, Shapes, session,
                         "Shapes")
        insert_data_bulk(stops_data, Stops, session, "Stops", column_mapping=stops_mapping)
        insert_data_bulk(stop_times_data, StopTimes, session, "Stop Times", column_mapping=stop_times_mapping)
        insert_data_bulk(trips_data, Trips, session, "Trips", column_mapping=trips_mapping)

        session.commit()
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        session.rollback()
    finally:
        session.close()
