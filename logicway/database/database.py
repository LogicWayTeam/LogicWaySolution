from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import envsh
import os

envsh.load(search_paths=["../.."])

IS_BUILD_PHASE = os.environ.get('APP_BUILD_PHASE') == '1'
if not IS_BUILD_PHASE:
    db_name = envsh.read_env('DB_NAME', str)
    db_user = envsh.read_env('DB_USER', str)
    db_password = envsh.read_env('DB_PASSWORD', str)
    db_host = envsh.read_env('DB_HOST', str)
    db_port = envsh.read_env('DB_PORT', int)

    if not all([db_name, db_user, db_password, db_host, db_port]):
        raise ValueError("Database configuration is not set in environment variables.")

    DATABASE_URL = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
else:
    DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db'

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)