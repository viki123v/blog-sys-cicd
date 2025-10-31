import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Header
from passlib.context import CryptContext

from src.dtos import JwtToken, JwtUser


class JwtExpired(Exception):
    def __init__(self, *args):
        super().__init__(*args)


def hash_bcrypt(password: str) -> str:
    return sec_ctx.hash(password, scheme="bcrypt")


def create_jwt(data: dict) -> str:
    exp_time = datetime.now(timezone.utc) + timedelta(hours=1)
    data.update({"exp": exp_time})
    return jwt.encode(data, jwk, jwk_hash_algo)


def extract_token_from_auth_header(auth_header: str) -> str:
    auth_header_parts = auth_header.split(" ")
    if len(auth_header_parts) != 2 or auth_header_parts[0].lower() != "bearer":
        raise ValueError("Invalid Authorization header format")
    return auth_header_parts[1]


def decode_jwt(token: Annotated[str, Header(alias="Authorization")]) -> JwtUser:
    decoded_jwt: JwtToken = jwt.decode(
        extract_token_from_auth_header(token), jwk, jwk_hash_algo
    )
    exp_timestamp = datetime.fromtimestamp(decoded_jwt["exp"])

    if exp_timestamp < datetime.now():
        raise JwtExpired("The jwt has expired")
    return JwtUser(username=decoded_jwt["username"])


jwk_hash_algo = "HS256"
jwk = os.getenv("JWK")
sec_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
