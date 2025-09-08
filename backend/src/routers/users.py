import json
import shutil
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src import OBJECT_URL
from src.dtos import BlogUserRegisterDTO
from src.models import BlogUser, create_session
from src.security import create_jwt, hash_bcrypt, sec_ctx

router = APIRouter(tags=["users"])

#TODO: add register with multipart files 
@router.post("/register")
def register_user_without_icon(
    new_user_dto: BlogUserRegisterDTO,
    session: Annotated[Session, Depends(create_session)],
):
    new_user = BlogUser(
        username=new_user_dto.username,
        password_hash=hash_bcrypt(new_user_dto.password),
    )

    session.add(new_user)
    session.commit()
        
    return JSONResponse(
        status_code=201,
        content={"bearer": create_jwt({"username": new_user.username})}
    )

def parse_user_file(user:UploadFile) -> BlogUserRegisterDTO:
    user_json = json.load(user.file)
    return BlogUserRegisterDTO(username=user_json['username'], password=user_json['password'])

def get_file_extension(icon:UploadFile) -> str:
    if icon.filename is None: 
        raise ValueError("Icon doesn't have a name")    

    file_extension = icon.filename.split(".")[1]

    if file_extension is None: 
        raise ValueError("Icon doesn't have a type")
    
    return file_extension

#TODO: move to s3, because of distributed nature 
def create_icon_file(icon: UploadFile, icon_file_name:str, file_extension:str):
    root_path = Path(__file__).parent.parent / 'assets' / 'user_icons'
    
    file_name = icon_file_name + '.' +  file_extension

    with open(root_path / file_name ,'wb') as f:    
        shutil.copyfileobj(icon.file,f)
    

@router.post("/register/file")
async def register_user_with_icon(session: Annotated[Session,Depends(create_session)], icon:UploadFile|None = None, user:UploadFile|None = None):
    if icon is None or user is None: 
        return JSONResponse(status_code=404, content={"message" : "You haven't provided the user or icon"})  

    user_dto = parse_user_file(user)
    file_extension = get_file_extension(icon)

    new_user=BlogUser(
        username=user_dto.username,
        password_hash=hash_bcrypt(user_dto.password),
        icon_url = f'{OBJECT_URL}/{user_dto.username}.{file_extension}'
    )

    session.add(new_user)
    session.commit()

    create_icon_file(icon, new_user.username, file_extension)

    return JSONResponse(status_code=201, content={"bearer": create_jwt({"username": new_user.username})})
    


@router.post("/login")
def login_user(
    user: BlogUserRegisterDTO, session: Annotated[Session, Depends(create_session)]
):
    db_user = session.get(BlogUser, user.username)

    if db_user is None or not sec_ctx.verify(user.password,db_user.password_hash):
        return JSONResponse(
            status_code=404, content={"message": "Username or password not valid"}
        )

    return JSONResponse(status_code=200, content={"bearer": create_jwt({"username": user.username})})
