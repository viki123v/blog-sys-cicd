import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError

from src.routers import blogs, users

app = FastAPI()


@app.exception_handler(IntegrityError)
def handle_integrity_error(_, exc: IntegrityError):
    exc_org = str(exc.orig)

    if "duplicate key" in exc_org and "blog_users_pkey" in exc_org:
        return JSONResponse(
            content={"message": "User with this username already exists"},
            status_code=404,
        )
    return JSONResponse(content={"message": "Database error"}, status_code=500)


origin = os.getenv("ALLOWED_ORIGIN")

if origin is None:
    raise RuntimeError("No ALLOWED_ORIGIN defined")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/assets", StaticFiles(directory="src/assets"), name="assets")
app.include_router(users.router)
app.include_router(blogs.router)
