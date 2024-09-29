import os
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv


load_dotenv()

db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')

engine = create_engine(f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")


def fetch_and_convert_to_json():
    with Session(engine) as session:
        # TODO : SQL dialect is not configured
        query = text("SELECT stop_id, stop_name, stop_lat, stop_lon, zone_id, stop_code FROM stops;")
        result = session.execute(query)

        stops = [dict(row) for row in result.mappings().all()]

        with open("stops_data.json", "w", encoding="UTF-8") as json_file:
            json.dump(stops, json_file, indent=4, ensure_ascii=False)

        print("Data saved to stops_data.json")


fetch_and_convert_to_json()
