from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from pydantic import BaseModel, EmailStr
from typing import Annotated
from annotated_types import MaxLen, MinLen
import json

import uvicorn
from database import create_user, verify_user, get_user_data
from githubOauth import github_router
from project_actions import project_router
from user_actions import user_router
from access_token_actions import create_access_token, decode_access_token
from config import SECRET_KEY, ALGORITHM


app = FastAPI()
app.include_router(github_router)
app.include_router(project_router)
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RegisterModel(BaseModel):
    username: Annotated[str, MinLen(3), MaxLen(10)]
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]
    grade: Annotated[str, MinLen(1)]

class LoginModel(BaseModel):
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]



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
async def check_token(request: Request):
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

@app.get("/data")
async def get_data():
    with open('data/options.json', 'r') as file:
        data = json.load(file)
        return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
