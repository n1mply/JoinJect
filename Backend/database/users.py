from bcrypt import hashpw, gensalt, checkpw
from . import users_collection
import os
from uploader import AVATARS_DIR

async def create_user(user_data: dict):
    existing_email = await users_collection.find_one({"mail": user_data["mail"]})
    existing_username = await users_collection.find_one({"username": user_data["username"]})
    if existing_username or existing_email:
        return {"error": "A user with the same username or email already exists"}

    hashed_password = hashpw(user_data["password"].encode('utf-8'), gensalt())
    user_data["password"] = hashed_password.decode('utf-8')
    result = await users_collection.insert_one(user_data)
    return {"user_id": str(result.inserted_id)}

async def verify_user(user_data: dict):
    user = await users_collection.find_one({"mail": user_data["mail"]})
    if not user:
        return {"error": "Incorrect email or passwrod"}

    if checkpw(user_data["password"].encode('utf-8'), user["password"].encode('utf-8')):
        return {"success": "Success"}
    return {"error": "Incorrect email or passwrod"}

async def get_user_data(mail: str):
    user = await users_collection.find_one({"mail": mail})
    return user["username"]

async def create_user_from_github(user_data: dict):
    existing_user = await users_collection.find_one({"username": user_data["username"]})
    if existing_user:
        return {"user_id": str(existing_user["_id"])}
    user_data["password"] = ""
    result = await users_collection.insert_one(user_data)
    return {"user_id": str(result.inserted_id)}

async def get_userdata_by_name(name: str):
    user_data = await users_collection.find_one({'username': name})
    if user_data:
        user_data['_id'] = str(user_data['_id']) 
        return user_data
    return None

async def update_user(username: str, update_data: dict):
    result = await users_collection.update_one(
        {"username": username},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        return {"error": "User not found or data not modified"}
    return {"success": True}

async def update_user_profile(username: str, update_data: dict):
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
