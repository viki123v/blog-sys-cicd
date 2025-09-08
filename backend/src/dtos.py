from typing import Optional

from pydantic import BaseModel, Field


class BlogUserRegisterDTO(BaseModel):
    username: str
    password: str
    icon_url: Optional[str] = Field(default=None)

class JwtUser(BaseModel):
    username:str 