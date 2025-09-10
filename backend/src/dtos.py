from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BlogUserRegisterDTO(BaseModel):
    username: str
    password: str
    icon_url: Optional[str] = Field(default=None)

class JwtUser(BaseModel):
    username:str 

class BlogDTO(BaseModel): 
    title: str 
    content: str
    published_at: datetime
    description: str
 