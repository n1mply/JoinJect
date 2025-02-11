from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Annotated
from annotated_types import MaxLen, MinLen
import asyncio

import uvicorn
from database import create_user, verify_user, get_user_data
from generate_secret_key import generate_secret_key

# App and CORS setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = generate_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 999999

# Models
class RegisterModel(BaseModel):
    username: Annotated[str, MinLen(3), MaxLen(20)]
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]

class LoginModel(BaseModel):
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]

# Utility functions for JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Endpoints
@app.post("/register")
async def register(user: RegisterModel):
    result = await create_user(user.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "User created successfully"}

@app.post("/login")
async def login(user: LoginModel, response: Response):
    result = await verify_user(user.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    username = await get_user_data(user.mail)
    access_token = create_access_token({"sub": username})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return {"message": "Login successful"}

@app.get("/me")
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_access_token(token)
    return {"username": username}

@app.get("/auth/check-token")
def check_token(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        print("Token is missing in the request cookies.")
        raise HTTPException(status_code=401, detail="Token missing")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"message": "Token is valid", "user": payload.get("sub")}
    except jwt.ExpiredSignatureError:
        print("Token has expired.")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError as e:
        print("Invalid token:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
