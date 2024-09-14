import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from models import Agency, Calendar, Routes, Shapes, Stops, StopTimes, Trips
from tqdm import tqdm

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join('/home/nikolay/PycharmProjects/LogicWay/myproject/', 'new_data')

# File paths
agency_file = os.path.join(data_dir, 'agency.txt')
calendar_file = os.path.join(data_dir, 'calendar.txt')
routes_file = os.path.join(data_dir, 'routes.txt')
shapes_file = os.path.join(data_dir, 'shapes.txt')
stops_file = os.path.join(data_dir, 'stops.txt')
stop_times_file = os.path.join(data_dir, 'stop_times.txt')
trips_file = os.path.join(data_dir, 'trips.txt')

# Read data files
agency_data = pd.read_csv(agency_file)
calendar_data = pd.read_csv(calendar_file)
routes_data = pd.read_csv(routes_file)
shapes_data = pd.read_csv(shapes_file)
stops_data = pd.read_csv(stops_file)
stop_times_data = pd.read_csv(stop_times_file)
trips_data = pd.read_csv(trips_file)

# Convert data types to standard Python types
def convert_data_types(df):
    for col in df.columns:
        if pd.api.types.is_integer_dtype(df[col]):
            df[col] = df[col].astype(int)
        elif pd.api.types.is_float_dtype(df[col]):
            df[col] = df[col].astype(float)
        elif pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].astype(str)
        elif pd.api.types.is_bool_dtype(df[col]):
            df[col] = df[col].astype(bool)
    return df

def remove_duplicates(df, unique_columns):
    return df.drop_duplicates(subset=unique_columns)

agency_data = convert_data_types(agency_data)
calendar_data = convert_data_types(calendar_data)
routes_data = convert_data_types(routes_data)
shapes_data = convert_data_types(shapes_data)
shapes_data = remove_duplicates(shapes_data, ['shape_id'])
stops_data = convert_data_types(stops_data)
stop_times_data = convert_data_types(stop_times_data)
trips_data = convert_data_types(trips_data)

# Create database connection
engine = create_engine('postgresql+psycopg2://devops1:nikita228@localhost/logic_way_db')
Session = scoped_session(sessionmaker(bind=engine))

def insert_data(data, model_class, session, message, column_mapping=None):
    print(f"Starting to load: {message}")
    for _, row in tqdm(data.iterrows(), total=len(data), desc=message):
        kwargs = {}
        if column_mapping:
            for csv_col, model_attr in column_mapping.items():
                if csv_col in row:
                    value = row[csv_col]
                    if model_attr.endswith('_id') and not pd.isna(value):
                        value = str(value)
                    kwargs[model_attr] = value
        else:
            kwargs = row.to_dict()
            for key in kwargs:
                if key.endswith('_id') and not pd.isna(kwargs[key]):
                    kwargs[key] = str(kwargs[key])

        if 'start_date' in kwargs and isinstance(kwargs['start_date'], (int, str)):
            kwargs['start_date'] = pd.to_datetime(kwargs['start_date'], format='%Y%m%d').date()
        if 'end_date' in kwargs and isinstance(kwargs['end_date'], (int, str)):
            kwargs['end_date'] = pd.to_datetime(kwargs['end_date'], format='%Y%m%d').date()
        if 'arrival_time' in kwargs and isinstance(kwargs['arrival_time'], str):
            kwargs['arrival_time'] = pd.to_datetime(kwargs['arrival_time'], format='%H:%M:%S').time()
        if 'departure_time' in kwargs and isinstance(kwargs['departure_time'], str):
            kwargs['departure_time'] = pd.to_datetime(kwargs['departure_time'], format='%H:%M:%S').time()

        obj = model_class(**kwargs)
        session.merge(obj)
    print("Finished")

routes_mapping = {
    'route_id': 'route_id',
    'agency_id': 'agency_id',
    'route_short_name': 'route_short_name',
    'route_long_name': 'route_long_name',
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

# Process data and write to the database with column mappings
with Session() as session:
    try:
        insert_data(agency_data, Agency, session, "Agencies")
        insert_data(calendar_data, Calendar, session, "Calendar")
        insert_data(routes_data, Routes, session, "Routes", column_mapping=routes_mapping)
        insert_data(shapes_data, Shapes, session, "Shapes")
        insert_data(stops_data, Stops, session, "Stops", column_mapping=stops_mapping)
        insert_data(stop_times_data, StopTimes, session, "Stop Times", column_mapping=stop_times_mapping)
        insert_data(trips_data, Trips, session, "Trips", column_mapping=trips_mapping)

        session.commit()
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        session.rollback()

print("Everything is ok")
