from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

IS_BUILD_PHASE = os.environ.get('APP_BUILD_PHASE') == '1'
if not IS_BUILD_PHASE:
    db_name = os.getenv('DB_NAME')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT')

    if not all([db_name, db_user, db_password, db_host, db_port]):
        raise ValueError("Database configuration is not set in environment variables.")

    DATABASE_URL = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
else:
    DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db'

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)