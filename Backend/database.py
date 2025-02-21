from motor.motor_asyncio import AsyncIOMotorClient
from bcrypt import hashpw, gensalt, checkpw

MONGO_URL = "mongodb://localhost:27017/"
client = AsyncIOMotorClient(MONGO_URL)
db = client.test
users_collection = db.users

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
        # Проверяем, существует ли пользователь с таким username
        existing_user = await users_collection.find_one({"username": user_data["username"]})
        if existing_user:
            return {"user_id": str(existing_user["_id"])}

        # Создаём нового пользователя
        user_data["password"] = ""  # Пароль не нужен для OAuth
        result = await users_collection.insert_one(user_data)
        return {"user_id": str(result.inserted_id)}
    except Exception as e:
        print(f"Ошибка при создании пользователя через GitHub: {e}")
        return {"error": "Error when creating user from GitHub"}