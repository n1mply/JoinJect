from motor.motor_asyncio import AsyncIOMotorClient
from bcrypt import hashpw, gensalt, checkpw
from bson.objectid import ObjectId

MONGO_URL = "mongodb://localhost:27017/"
client = AsyncIOMotorClient(MONGO_URL)
db = client.test
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
    return {'message': 'Project has been created!', 'project_id': str(result.inserted_id)}


async def get_projects():
    projects = []
    async for project in projects_collection.find():
        project["_id"] = str(project["_id"])
        projects.append(project)
    print(str(project["_id"]))
    return projects