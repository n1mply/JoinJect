from typing import Annotated
from annotated_types import MaxLen, MinLen
from fastapi import HTTPException, APIRouter, Request, Response
from jose import jwt
from pydantic import BaseModel, EmailStr

from config import ALGORITHM, SECRET_KEY
from .access_token_router import create_access_token
from database.users import create_user, get_user_data, verify_user


auth_router = APIRouter()


class RegisterModel(BaseModel):
    username: Annotated[str, MinLen(3), MaxLen(10)]
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]
    grade: Annotated[str, MinLen(1)]

class LoginModel(BaseModel):
    mail: EmailStr
    password: Annotated[str, MinLen(8), MaxLen(100)]



@auth_router.post("/register")
async def register(user: RegisterModel):
    result = await create_user(user.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "User created successfully"}

@auth_router.post("/login")
async def login(user: LoginModel, response: Response):
    result = await verify_user(user.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    username = await get_user_data(user.mail)
    access_token = create_access_token({"sub": username})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return {"message": "Login successful"}


@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

@auth_router.get("/auth/check-token")
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