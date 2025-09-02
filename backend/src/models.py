import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import String, Text, create_engine 
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    type_annotation_map = {
        str: String(100),
    }


class Blog(Base):
    __tablename__ = "blogs"

    author: Mapped["BlogUser"] = relationship(back_populates="blogs")
    title: Mapped[str] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(type_= Text)
    published_at: Mapped[datetime]
    description: Mapped[str]

class BlogUser(Base):
    __tablename__ = "blog_users"    

    username: Mapped[str] = mapped_column(primary_key=True)
    email: Mapped[str]
    password_hash: Mapped[str] = mapped_column(name='password')
    icon_url: Mapped[str] 
    blogs: Mapped[list["Blog"]] = relationship(back_populates="author") 

envs=load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

user=os.getenv("POSTGRES_USER")
password=os.getenv("POSTGRES_PASSWORD")
db_name=os.getenv("POSTGRES_DB")
host=os.getenv("DB_HOST")
port=os.getenv("DB_PORT")

if user is None or password is None or\
      host is None or port is None or db_name is None : 
    raise ValueError("The required env variables POSTGRES_USER,POSTGRES_PASSWORD,DB_HOST,DB_PORT aren't defined")

engine = create_engine(f"postgresql+psycopg://{user}:{password}@{host}:{port}/{db_name}", echo=True)
Base.metadata.create_all(engine)