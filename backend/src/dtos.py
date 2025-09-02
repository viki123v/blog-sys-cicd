from datetime import datetime
from typing import TypedDict

from pydantic import BaseModel, Field


class BlogUserRegisterDTO(BaseModel):
    username: str
    password: str
    icon_url: str | None = Field(default=None)

class JwtUser(BaseModel):
    username:str 
    logo:str | None = None

class BlogCreateDTO(BaseModel):
    title: str
    content: str
    description: str

class BlogDTO(BaseModel): 
    # Blog info 
    title: str 
    content: str
    description: str

    published_at: datetime
    
    # User info 
    username: str 
    user_icon_url: str | None 
 
class JwtToken(TypedDict):
    exp: int
    username: str

class UpdateUserDTO(BaseModel):
    username: str | None = None
    password: str | None = None
    
class UpdateBlogDto(BaseModel):
    content:str
    description:str