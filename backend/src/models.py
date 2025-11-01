from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    type_annotation_map = {
        str: String(100),
    }


class Blog(Base):
    __tablename__ = "blogs"

    author_id: Mapped[str] = mapped_column(
        ForeignKey("blog_users.username", onupdate="CASCADE")
    )
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
