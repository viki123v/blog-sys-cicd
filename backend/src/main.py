from fastapi import FastAPI
from src.dtos import * 

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
