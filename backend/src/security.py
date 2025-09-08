import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from src.dtos import JwtUser


class JwtExpired(Exception):
    def __init__(self, *args):
        super().__init__(*args)

def hash_bcrypt(password: str) -> str:
    return sec_ctx.hash(password, scheme="bcrypt")

def create_jwt(data:dict) -> str:
   exp_time=datetime.now(timezone.utc) + timedelta(hours=1)
   data.update({"exp": exp_time})
   return jwt.encode(data, jwk, jwk_hash_algo)

def decode_jwt(data:str) -> JwtUser:
    decoded_jwt=jwt.decode(data,jwk,jwk_hash_algo)
    exp_timestamp = datetime.fromtimestamp(decoded_jwt['timestamp'])

    if exp_timestamp < datetime.now():
        raise JwtExpired("The jwt has expired")
    return JwtUser(username=decoded_jwt['username'])

jwk_hash_algo='HS256'
jwk=os.getenv("JWK")
sec_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    