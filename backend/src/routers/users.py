import json
import shutil
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy import update
from sqlalchemy.orm import Session

from src import OBJECT_URL
from src.connection import create_session
from src.dtos import BlogUserRegisterDTO, JwtUser, UpdateUserDTO
from src.models import BlogUser
from src.security import create_jwt, decode_jwt, hash_bcrypt, sec_ctx
from src.shared import user_icons_folder

router = APIRouter(tags=["users"])


def parse_user_file(user: UploadFile) -> BlogUserRegisterDTO:
    user_json = json.load(user.file)
    return BlogUserRegisterDTO(
        username=user_json["username"], password=user_json["password"]
    )


def get_file_extension(icon: UploadFile) -> str:
    if icon.filename is None:
        raise ValueError("Icon doesn't have a name")
    if icon.content_type is None:
        raise ValueError("No Content-Type for the file is provided")

    # Must have in the reqeust
    # Pattern: image/*
    return icon.content_type.split("/")[1]


def create_icon_file(icon: UploadFile, icon_file_name: str, file_extension: str):
    if not user_icons_folder.exists():
        user_icons_folder.mkdir()

    file_name = icon_file_name + "." + file_extension

    with open(user_icons_folder / file_name, "wb") as f:
        shutil.copyfileobj(icon.file, f)


def if_none_then[T](value: T | None, default: T) -> T:
    return value if value is not None else default


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
        status_code=200,
        content={
            "bearer": create_jwt(
                {"username": new_user.username, "logo": new_user.icon_url}
            )
        },
    )


@router.post("/register/file")
async def register_user_with_icon(
    session: Annotated[Session, Depends(create_session)],
    icon: UploadFile | None = None,
    user: UploadFile | None = None,
):
    if icon is None or user is None:
        return JSONResponse(
            status_code=400,
            content={"message": "You haven't provided the user or icon"},
        )

    user_dto = parse_user_file(user)
    file_extension = get_file_extension(icon)

    new_user = BlogUser(
        username=user_dto.username,
        password_hash=hash_bcrypt(user_dto.password),
        icon_url=f"{OBJECT_URL}/{user_dto.username}.{file_extension}",
    )

    session.add(new_user)
    session.commit()

    create_icon_file(icon, new_user.username, file_extension)

    return JSONResponse(
        status_code=201,
        content={
            "bearer": create_jwt(
                {"username": new_user.username, "logo": new_user.icon_url}
            )
        },
    )


@router.post("/login")
def login_user(
    user: BlogUserRegisterDTO, session: Annotated[Session, Depends(create_session)]
):
    db_user = session.get(BlogUser, user.username)

    if db_user is None or not sec_ctx.verify(user.password, db_user.password_hash):
        return JSONResponse(
            status_code=400, content={"message": "Username or password not valid"}
        )

    return JSONResponse(
        status_code=200,
        content={
            "bearer": create_jwt({"username": user.username, "logo": db_user.icon_url})
        },
    )


@router.get("/users")
def get_user(
    session: Annotated[Session, Depends(create_session)],
    _user: Annotated[JwtUser, Depends(decode_jwt)],
    username: str,
):
    db_user = session.get(BlogUser, username)

    if db_user is None:
        return JSONResponse(status_code=404, content={"message": "User not found"})

    return {
        "username": db_user.username,
        "logo": db_user.icon_url,
        "created_at": db_user.member_since.isoformat(),
        "blog_count": len(db_user.blogs),
    }


@router.put("/users")
def update_user(
    session: Annotated[Session, Depends(create_session)],
    user: Annotated[JwtUser, Depends(decode_jwt)],
    updateUserDTO: UpdateUserDTO,
    username: str,
):
    if username != user.username:
        return JSONResponse(
            status_code=403, content={"message": "You can only update your own user"}
        )

    db_user = session.get(BlogUser, username)

    if db_user is None:
        return JSONResponse(status_code=404, content={"message": "User not found"})

    new_password = (
        hash_bcrypt(updateUserDTO.password)
        if updateUserDTO.password is not None and updateUserDTO.password.strip() != ''
        else db_user.password_hash
    )
    new_username = if_none_then(updateUserDTO.username, username)

    try:
        session.execute(
            update(BlogUser)
            .where(BlogUser.username == user.username)
            .values(username=new_username, password_hash=new_password)
        )
        session.commit()
        return JSONResponse(
            status_code=200,
            content={
                "message" : "Changed"
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"message": str(e)},
        )
