import shutil
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.dtos import BlogDTO
from src.models import Blog, create_session
from src.shared import blogs_content_folder

router=APIRouter(tags=['blogs'])

# If blog_title is provided, then search for something more 
@router.get("/blogs")
def get_blogs(
    blog_title: str,
    session: Annotated[Session,Depends(create_session)]
):
    blog_for_title = session.scalar(select(Blog).where(Blog.title.istartswith(blog_title)))

    if blog_for_title is None: 
        return JSONResponse(
            status_code=404,
            content={
                "message" : "No blogs are found for the given title"
            }
        )
    
    return BlogDTO( 
        title=blog_for_title.title,
        content=blog_for_title.content,
        published_at=blog_for_title.published_at,
        description=blog_for_title.description
    )
    

@router.post("/blogs")
def create_blog():
    pass

@router.post("/attachments")
def upload_attachment(file: UploadFile):
    if file.filename is None: 
        return JSONResponse(
            status_code=400, 
            content={
                "message" : "You haven't given the file a name"
            }
        )    

    with open(blogs_content_folder / file.filename, 'wb') as fd:
        shutil.copyfileobj(file.file, fd)
    