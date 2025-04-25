from fastapi import HTTPException, APIRouter, Depends, Request
from jose import jwt
from pydantic import BaseModel
from typing import Annotated
from annotated_types import MaxLen, MinLen
from database import get_userdata_by_name, update_user
from config import SECRET_KEY, ALGORITHM

user_router = APIRouter()

class FinishModel(BaseModel):
    bio: Annotated[str, MinLen(60), MaxLen(200)]
    selectedGrade: Annotated[str, MinLen(1)]
    selectedSkills: Annotated[list, MinLen(5), MaxLen(40)]


@user_router.get('/user/{name}')
async def get_user_by_name(name: str, request: Request):
    print(f"Searching for user: {name}")
    user_data = await get_userdata_by_name(name)
    if not user_data or 'error' in user_data:
        raise HTTPException(status_code=404, detail='User not found!')
    is_owner = False
    token = request.cookies.get("access_token")
    
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_username = payload.get("sub")
            is_owner = (current_username == name)
        except (jwt.JWTError, jwt.ExpiredSignatureError):
            pass  #is_owner останется False
    
    return {
        'user_data': user_data,
        'is_owner': is_owner
    }

@user_router.put('/user/finish')
async def add_final_user_data(user_add_data: FinishModel, request: Request):
    token = request.cookies.get("access_token")
    print(user_add_data)
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            await update_user(username, user_add_data.dict())
            return {"message": "Profile was updated!"}
        except (jwt.JWTError, jwt.ExpiredSignatureError):
            return HTTPException(status_code=403)  
