import logging
import shutil
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.dtos import BlogCreateDTO, BlogDTO, JwtUser, UpdateBlogDto
from src.models import Blog, create_session
from src.security import decode_jwt
from src.shared import blogs_content_folder

router = APIRouter(tags=["blogs"])
logger=logging.getLogger(__name__)


@router.get("/blogs")
def get_blogs(
    session: Annotated[Session, Depends(create_session)],
    title: str | None = None 
):
    if title is None:
        return fetch_all_blogs(session)
    else:
        return fetch_blog_by_title(session, title)


@router.post("/blogs")
def create_blog(
    blog_dto: BlogCreateDTO,
    session: Annotated[Session, Depends(create_session)],
    user: Annotated[JwtUser, Depends(decode_jwt)],
):
    new_blog = Blog(
        author_id=user.username,
        title=blog_dto.title,
        content=blog_dto.content,
        published_at=datetime.now(),
        description=blog_dto.description,
    )
    try:
        session.add(new_blog)
        session.commit()
        return Response(status_code=201)
    except Exception as e:
        logging.error("Error creating blog: {}".format(str(e)))
        return JSONResponse(
            status_code=400,
            content={"message": str(e)},
        )


@router.post("/attachments")
def upload_attachment(file: UploadFile):
    if file.filename is None:
        return JSONResponse(
            status_code=400, content={"message": "You haven't given the file a name"}
        )

    with open(blogs_content_folder / file.filename, "wb") as fd:
        shutil.copyfileobj(file.file, fd)
        
@router.delete('/blogs')
def delete_blog(
    title: str,
    user:Annotated[JwtUser,Depends(decode_jwt)],
    session:Annotated[Session,Depends(create_session)]
):
   db_blog=session.get(Blog, title)
   
   if db_blog is None: 
       return JSONResponse(
           status_code=404,
           content={"message": "Blog doesn't exist"}
       )
   
   if db_blog.author_id != user.username:
       return JSONResponse(
           status_code=403,
           content={"message": "You don't have access to change"}
       )
       
   session.delete(db_blog)
   session.commit()
   
   return JSONResponse(
       status_code=200,
       content={"message": "Blog deleted"}
   ) 

@router.put("/blogs")
def update_blog(
    session:Annotated[Session,Depends(create_session)],
    user:Annotated[JwtUser, Depends(decode_jwt)],
    title:str, 
    blog:UpdateBlogDto
): 
    db_blog=session.get(Blog,title)
    
    if db_blog is None:
        return JSONResponse(
            status_code=404,
            content={"message": "Not found"}
        )
    if db_blog.author_id != user.username:
        return JSONResponse(
            status_code=403,
            content={
                "message" : "Not authorized"
            }
        )
    
    db_blog.description = db_blog.description if not check_str_input(blog.description) else blog.description
    db_blog.content = db_blog.content if not check_str_input(blog.content) else blog.content
    
    session.commit()
    
    return JSONResponse(
        status_code=200,
        content={
            "message" : "Updated"
        }
    ) 


def map_blog_to_dto(blog: Blog) -> BlogDTO:
    return BlogDTO(
        title=blog.title,
        content=blog.content,
        published_at=blog.published_at,
        description=blog.description,
        username=blog.author.username,
        user_icon_url=blog.author.icon_url,
    )


def fetch_all_blogs(session: Session):
    blogs = session.scalars(select(Blog)).all()
    blog_dtos = list(map(map_blog_to_dto, blogs))
    return {"blogs": blog_dtos}


def fetch_blog_by_title(session: Session, title: str):
    blog_for_title = session.scalar(select(Blog).where(Blog.title.istartswith(title)))

    if blog_for_title is None:
        return {"blogs": []} 

    return {"blogs": [map_blog_to_dto(blog_for_title)]}


def check_str_input(x:str|None) -> bool:
    return x is not None and x.strip() != '' 