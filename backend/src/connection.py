import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session


def create_session_factory(engine):
    def get_session():
        with Session(engine) as session:
            yield session

    return get_session

user = os.getenv("POSTGRES_USER")
password = os.getenv("POSTGRES_PASSWORD")
db_name = os.getenv("POSTGRES_DB")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")

if user is None or password is None or host is None or port is None or db_name is None:
    raise ValueError(
        "The required env variables POSTGRES_USER,POSTGRES_PASSWORD,DB_HOST,DB_PORT aren't defined"
    )

engine = create_engine(
    f"postgresql+psycopg://{user}:{password}@{host}:{port}/{db_name}", echo=True
)
create_session = create_session_factory(engine)
