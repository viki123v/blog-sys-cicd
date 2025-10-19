import os
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship


def create_session_factory(engine):
    def get_session():
        with Session(engine) as session:
            yield session

    return get_session


class Base(DeclarativeBase):
    type_annotation_map = {
        str: String(100),
    }


class Blog(Base):
    __tablename__ = "blogs"

    author_id: Mapped[str] = mapped_column(ForeignKey("blog_users.username", onupdate="CASCADE"))
    author: Mapped["BlogUser"] = relationship(cascade="save-update, merge")
    title: Mapped[str] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(type_=Text)
    published_at: Mapped[datetime]
    description: Mapped[str]


class BlogUser(Base):
    __tablename__ = "blog_users"

    username: Mapped[str] = mapped_column(primary_key=True)
    password_hash: Mapped[str] = mapped_column(name="password")
    icon_url: Mapped[Optional[str]]
    blogs: Mapped[list["Blog"]] = relationship(back_populates="author")
    member_since: Mapped[datetime] = mapped_column(default=datetime.now)


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

Base.metadata.create_all(engine)
