import os
from motor.motor_asyncio import AsyncIOMotorClient
from bcrypt import hashpw, gensalt, checkpw
from bson.objectid import ObjectId
import re

from uploader import AVATARS_DIR

MONGO_URL = "mongodb://localhost:27017/"
client = AsyncIOMotorClient(MONGO_URL)
db = client.data
users_collection = db.users
projects_collection = db.projects

async def create_user(user_data: dict):
    try:
        existing_email = await users_collection.find_one({"mail": user_data["mail"]})
        existing_username = await users_collection.find_one({"username": user_data["username"]})
        if existing_username or existing_email:
            return {"error": "A user with the same username or email already exists"}

        hashed_password = hashpw(user_data["password"].encode('utf-8'), gensalt())
        user_data["password"] = hashed_password.decode('utf-8')
        print(user_data)
        result = await users_collection.insert_one(user_data)
        return {"user_id": str(result.inserted_id)}
    except Exception as e:
        print(f"Ошибка при создании пользователя: {e}")
        return {"error": "Error when creating user"}

async def verify_user(user_data: dict):
    email = user_data['mail']
    password = user_data['password']
    try:
        user = await users_collection.find_one({"mail": email})
        if not user:
            return {"error": "Incorrect email or passwrod"}

        if checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return {"success": "Success"}
        else:
            return {"error": "Incorrect email or passwrod"}
    except Exception as e:
        print(f"Ошибка при проверке пользователя: {e}")
        return {"error": "Error when rotating user"}

async def get_user_data(mail: str) -> str:
    username = await users_collection.find_one({"mail": mail})
    return username['username']

async def create_user_from_github(user_data: dict):
    try:
        existing_user = await users_collection.find_one({"username": user_data["username"]})
        if existing_user:
            return {"user_id": str(existing_user["_id"])}
        user_data["password"] = ""
        result = await users_collection.insert_one(user_data)
        return {"user_id": str(result.inserted_id)}
    except Exception as e:
        print(f"Ошибка при создании пользователя через GitHub: {e}")
        return {"error": "Error when creating user from GitHub"}
    

async def create_project(data: dict, username: str):
    existing_project = await projects_collection.find_one({'name': data['name']})
    if existing_project:
        return {'error': 'Project with the same name already exists!'}


    data.update({"author": username})
    result = await projects_collection.insert_one(data)

    await users_collection.update_one(
        {"username": username},
        {"$addToSet": {"projects": data['name']}}
    )

    return {
        'message': 'Project has been created!',
        'project_id': str(result.inserted_id)
    }


async def get_projects():
    projects = []
    async for project in projects_collection.find():
        project["_id"] = str(project["_id"])
        projects.append(project)
    print(str(project["_id"]))
    return projects


async def get_projects_by_name(name: str):
    try:
        regex = re.compile(f'.*{re.escape(name)}.*', re.IGNORECASE)
        projects = await projects_collection.find({'name': {'$regex': regex}}).to_list(length=100)
        if projects:
            for project in projects:
                project['_id'] = str(project['_id'])
            return {'projects': projects[::-1]}
        else:
            return {'error': "No projects found with this name!"}
    except Exception as e:
        return {'error': str(e)}

async def get_userdata_by_name(name: str):
    try:
        user_data = await users_collection.find_one({'username': name})
        if user_data:
            user_data['_id'] = str(user_data['_id']) 
            return user_data
        else:
            return None 
    except Exception as e:
        return {'error': str(e)}
    
async def update_user(username: str, update_data: dict):
    try:
        result = await users_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            return {"error": "User not found or data not modified"}
        return {"success": True}
    except Exception as e:
        print(f"Update error: {e}")
        return {"error": "Database update failed"}
    

async def update_user_profile(username: str, update_data: dict):
    try:

        update_data = {k: v for k, v in update_data.items() if v not in (None, "", [])}
        
        if not update_data:
            return {"error": "No valid data to update"}
        
        if "avatar" in update_data:
            user = await users_collection.find_one({"username": username})
            if user and "avatar" in user:
                old_avatar = os.path.join(AVATARS_DIR, user["avatar"])
                if os.path.exists(old_avatar):
                    os.remove(old_avatar)
        
        result = await users_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return {"error": "No changes made"}
        return {"success": True}
    except Exception as e:
        print(f"Database error: {e}")
        return {"error": "Database operation failed"}
    

async def get_paginated_projects(page_number: int, page_size: int):
    skip_count = (page_number - 1) * page_size
    projects_cursor = projects_collection.find().skip(skip_count).limit(page_size)
    projects = await projects_cursor.to_list(length=None)
    
    for project in projects:
        project['_id'] = str(project['_id'])

    total_projects = await projects_collection.count_documents({})
    return {
        "projects": projects,
        "pagination": {
            "total": total_projects,
            "page": page_number,
            "page_size": page_size,
            "total_pages": (total_projects + page_size - 1) // page_size
        }
    }
    