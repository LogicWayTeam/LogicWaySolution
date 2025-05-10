import os
import pandas as pd
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from models import Base, Agency, Calendar, Routes, Shapes, Stops, StopTimes, Trips  # Убедитесь, что модели импортированы правильно
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
        'shape_pt_sequence': int,
        'shape_dist_traveled': float
    },
    stops_file: {
        'stop_id': str,
        'stop_name': str,
        'stop_lat': float,
        'stop_lon': float,
        'zone_id': str,
        'location_type': str,
        'parent_station': str
    },
    stop_times_file: {
        'trip_id': str,
        'arrival_time': str,
        'departure_time': str,
        'stop_id': str,
        'stop_sequence': int,
        'stop_headsign': str,
        'pickup_type': str,
        'drop_off_type': str,
        'shape_dist_traveled': str
    },
    trips_file: {
        'trip_id': str,
        'route_id': str,
        'service_id': str,
        'trip_headsign': str,
        'direction_id': str,
        'shape_id': str
    }
}


def read_csv_with_types(file_path, dtype_mapping, date_columns=[]):
    df = pd.read_csv(file_path, dtype=dtype_mapping, keep_default_na=False, na_values=[''])
    for date_column in date_columns:
        if date_column in df:
            df[date_column] = pd.to_datetime(df[date_column], format='%Y%m%d').dt.date
    return df


agency_data = read_csv_with_types(agency_file, dtype_mappings[agency_file])
calendar_data = read_csv_with_types(calendar_file, dtype_mappings[calendar_file],
                                    date_columns=['start_date', 'end_date'])
routes_data = read_csv_with_types(routes_file, dtype_mappings[routes_file])
shapes_data = read_csv_with_types(shapes_file, dtype_mappings[shapes_file])
stops_data = read_csv_with_types(stops_file, dtype_mappings[stops_file])
stop_times_data = read_csv_with_types(stop_times_file, dtype_mappings[stop_times_file])
trips_data = read_csv_with_types(trips_file, dtype_mappings[trips_file])

def safe_convert_time(time_str):
    if pd.isna(time_str) or time_str == '':
        return None
    try:
        hours, minutes, seconds = map(int, time_str.split(':'))
        if hours >= 24:
            hours = hours % 24

        corrected_time_str = f"{hours:02}:{minutes:02}:{seconds:02}"
        return datetime.strptime(corrected_time_str, '%H:%M:%S').time()
    except ValueError:
        return None


def get_existing_ids(session, model_class, id_column_name):
    try:
        inspector = inspect(model_class)
        primary_key_column = inspector.primary_key[0]
        if not primary_key_column.name == id_column_name:
            print(f"Warning: id_column_name '{id_column_name}' does not match PK '{primary_key_column.name}' for {model_class.__name__}. Ensure this is intended.")

        existing_ids_query = session.query(getattr(model_class, id_column_name)).all()
        existing_ids = {str(id_tuple[0]) for id_tuple in existing_ids_query if id_tuple[0] is not None}
        return existing_ids
    except Exception as e:
        print(f"Error getting existing IDs for {model_class.__name__} using column {id_column_name}: {e}")
        return set()


def insert_data_bulk(data, model_class, session, message, column_mapping=None, batch_size=1000): # Уменьшил batch_size для отладки, можно вернуть 10000
    objects = []
    skipped_existing = 0

    existing_ids = set()
    id_attr_name_in_model_for_check = None
    if column_mapping:
        inspector = inspect(model_class)
        if inspector.primary_key:
            pk_model_attr = inspector.primary_key[0].name
            csv_col_for_pk = None
            for csv_key, model_val in column_mapping.items():
                if model_val == pk_model_attr:
                    csv_col_for_pk = csv_key
                    break
            if csv_col_for_pk:
                id_attr_name_in_model_for_check = pk_model_attr
                pk_values_in_df = data[csv_col_for_pk].dropna().astype(str).unique()
                existing_ids = get_existing_ids(session, model_class, id_attr_name_in_model_for_check)


    for index, row in tqdm(data.iterrows(), total=len(data), desc=message):
        kwargs = {}
        current_id_value_for_check = None

        if column_mapping:
            for csv_col, model_attr in column_mapping.items():
                if csv_col in row:
                    value = row[csv_col]

                    if isinstance(value, str) and not value.strip():
                        value = None
                    elif pd.isna(value):
                        value = None

                    if model_attr.endswith('_id') and value is not None:
                        value = str(value)

                    kwargs[model_attr] = value
                    if model_attr == id_attr_name_in_model_for_check and value is not None:
                        current_id_value_for_check = str(value)
        else:
            kwargs = row.to_dict()
            for key, value in kwargs.items():
                if isinstance(value, str) and not value.strip():
                    kwargs[key] = None
                elif pd.isna(value):
                    kwargs[key] = None

                if key.endswith('_id') and kwargs[key] is not None:
                    kwargs[key] = str(kwargs[key])
            if not id_attr_name_in_model_for_check and inspector.primary_key:
                pk_model_attr = inspector.primary_key[0].name
                if pk_model_attr in kwargs and kwargs[pk_model_attr] is not None:
                    current_id_value_for_check = str(kwargs[pk_model_attr])


        if id_attr_name_in_model_for_check and current_id_value_for_check in existing_ids:
            skipped_existing += 1
            continue

        if 'arrival_time' in kwargs and isinstance(kwargs.get('arrival_time'), str):
            kwargs['arrival_time'] = safe_convert_time(kwargs['arrival_time'])
        if 'departure_time' in kwargs and isinstance(kwargs.get('departure_time'), str):
            kwargs['departure_time'] = safe_convert_time(kwargs['departure_time'])
        try:
            obj = model_class(**kwargs)
            objects.append(obj)
        except Exception as e:
            print(f"Error creating model instance for {model_class.__name__} with data {kwargs}: {e}")
            continue

        if len(objects) >= batch_size:
            try:
                session.bulk_save_objects(objects)
                session.flush()
                objects = []
            except SQLAlchemyError as e:
                print(f"Error during bulk save for {model_class.__name__}: {e}")
                session.rollback()
                objects = []
                # break
            except Exception as e:
                print(f"Unexpected error during bulk_save_objects for {model_class.__name__}: {e}")
                session.rollback()
                objects = []
                # break

    if objects:
        try:
            session.bulk_save_objects(objects)
            session.flush()
        except SQLAlchemyError as e:
            print(f"Error adding remaining objects for {model_class.__name__}: {e}")
            session.rollback()
        except Exception as e:
            print(f"Unexpected error adding remaining objects for {model_class.__name__}: {e}")
            session.rollback()

    if skipped_existing > 0:
        print(f"Skipped {skipped_existing} existing records for {model_class.__name__}.")
    print(f"Finished processing {message}")


agency_mapping = {
    'agency_id': 'agency_id',
    'agency_name': 'agency_name',
    'agency_url': 'agency_url',
    'agency_timezone': 'agency_timezone',
    'agency_phone': 'agency_phone',
    'agency_lang': 'agency_lang'
}

calendar_mapping = {
    'service_id': 'service_id',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday',
    'start_date': 'start_date',
    'end_date': 'end_date'
}

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

shapes_mapping = {
    'shape_id': 'shape_id',
    'shape_pt_lat': 'shape_pt_lat',
    'shape_pt_lon': 'shape_pt_lon',
    'shape_pt_sequence': 'shape_pt_sequence',
    'shape_dist_traveled': 'shape_dist_traveled'
}

stops_mapping = {
    'stop_id': 'stop_id',
    'stop_name': 'stop_name',
    'stop_lat': 'stop_lat',
    'stop_lon': 'stop_lon',
    'zone_id': 'zone_id',
    'location_type': 'location_type',
    'parent_station': 'parent_station'
}

stop_times_mapping = {
    'trip_id': 'trip_id',
    'arrival_time': 'arrival_time',
    'departure_time': 'departure_time',
    'stop_id': 'stop_id',
    'stop_sequence': 'stop_sequence',
    'stop_headsign': 'stop_headsign',
    'pickup_type': 'pickup_type',
    'drop_off_type': 'drop_off_type',
    'shape_dist_traveled': 'shape_dist_traveled'
}

trips_mapping = {
    'trip_id': 'trip_id',
    'route_id': 'route_id',
    'service_id': 'service_id',
    'trip_headsign': 'trip_headsign',
    'direction_id': 'direction_id',
    'shape_id': 'shape_id'
}


with Session() as session:
    try:
        print("Starting data import...")

        print("--- Processing Agencies ---")
        insert_data_bulk(agency_data, Agency, session, "Agencies", column_mapping=agency_mapping)
        session.commit()
        print("Committed Agencies. Check DB now.")

        print("--- Processing Calendar ---")
        insert_data_bulk(calendar_data, Calendar, session, "Calendar", column_mapping=calendar_mapping)
        session.commit()
        print("Committed Calendar. Check DB now.")

        print("--- Processing Routes ---")
        insert_data_bulk(routes_data, Routes, session, "Routes", column_mapping=routes_mapping)
        session.commit()
        print("Committed Routes. Check DB now.")

        print("--- Processing Shapes ---")
        insert_data_bulk(shapes_data, Shapes, session, "Shapes", column_mapping=shapes_mapping)
        session.commit()
        print("Committed Shapes. Check DB now.")

        print("--- Processing Stops ---")
        insert_data_bulk(stops_data, Stops, session, "Stops", column_mapping=stops_mapping)
        session.commit()
        print("Committed Stops. Check DB now.")

        print("--- Processing Trips ---")
        insert_data_bulk(trips_data, Trips, session, "Trips", column_mapping=trips_mapping)
        session.commit()
        print("Committed Trips. Check DB now.")

        print("--- Processing StopTimes ---")
        insert_data_bulk(stop_times_data, StopTimes, session, "Stop Times", column_mapping=stop_times_mapping)
        session.commit()
        print("Committed StopTimes. Check DB now.")

    except SQLAlchemyError as e:
        print(f"Database error during commit or final operations: {e}")
        print("Rolling back transaction...")
        session.rollback()
        print("Transaction rolled back.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print("Rolling back transaction...")
        session.rollback()
        print("Transaction rolled back.")
    finally:
        Session.remove()
        print("Session closed and removed.")