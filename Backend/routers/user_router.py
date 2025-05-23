import json
import os
from fastapi import File, Form, HTTPException, APIRouter, Depends, Request, UploadFile
from fastapi.responses import FileResponse
from jose import jwt
from pydantic import BaseModel
from typing import Annotated, Optional
from annotated_types import MaxLen, MinLen
from database import get_userdata_by_name, update_user, update_user_profile
from uploader import AVATARS_DIR, save_avatar
from config import SECRET_KEY, ALGORITHM

user_router = APIRouter()

class FinishModel(BaseModel):
    bio: Annotated[str, MinLen(60), MaxLen(200)]
    selectedGrade: Annotated[str, MinLen(1)]
    selectedSkills: Annotated[list, MinLen(4), MaxLen(40)]

@user_router.get('/user/{name}')
async def get_user_by_name(name: str, request: Request):
    print(f"Searching for user: {name}")
    user_data = await get_userdata_by_name(name)
    print(user_data)
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


@user_router.put("/user/edit")
async def edit_profile(
    request: Request,
    photo: UploadFile = File(None),
    bio: str = Form(None),
    skills: str = Form(None)
):
    token = request.cookies.get("access_token")
    try:
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                username = payload.get("sub")
            except (jwt.JWTError, jwt.ExpiredSignatureError):
                return HTTPException(status_code=403)
        
        update_data = {}
        if photo:
            filename = await save_avatar(username, photo)
            update_data["avatar"] = filename
        if bio:
            update_data["bio"] = bio
        if skills:
            try:
                skills_list = json.loads(skills)
                update_data["selectedSkills"] = skills_list
            except json.JSONDecodeError:
                raise HTTPException(400, "Invalid skills format")

        result = await update_user_profile(username, update_data)
        
        if "error" in result:
            raise HTTPException(400, detail=result["error"])
        
        return {
            "status": "success",
            "username": username,
            "updated_fields": list(update_data.keys())
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")
    

@user_router.get("/user/avatar/{username}")
async def get_avatar(username: str):
    user_data = await get_userdata_by_name(username)
    avatar_path = os.path.join(AVATARS_DIR, user_data["avatar"])
    if not os.path.exists(avatar_path):
        return FileResponse("static/default_avatar.png")
    print(avatar_path)
    return FileResponse(avatar_path, 
            headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        })