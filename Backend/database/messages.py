from datetime import datetime
from pydantic import BaseModel
from . import message_collection

class Message(BaseModel):
    sender: str
    receiver: str
    text: str
    timestamp: datetime = datetime.utcnow()

async def create_message_indexes():
    await message_collection.create_index([("sender", 1), ("receiver", 1)])
    await message_collection.create_index([("receiver", 1), ("sender", 1)])
    await message_collection.create_index("timestamp")
    await message_collection.create_index([
        ("sender", 1),
        ("receiver", 1),
        ("timestamp", 1)
    ], name="chat_history_idx")

async def save_message(sender: str, receiver: str, text: str):
    message = Message(sender=sender, receiver=receiver, text=text)
    result = await message_collection.insert_one(message.dict())
    saved_msg = message.dict()
    saved_msg['timestamp'] = saved_msg['timestamp'].isoformat()
    saved_msg['id'] = str(result.inserted_id)
    return saved_msg

async def get_messages_between_users(user1: str, user2: str, limit: int = 100):
    cursor = message_collection.find({
        "$or": [
            {"sender": user1, "receiver": user2},
            {"sender": user2, "receiver": user1}
        ]
    }).sort("timestamp", 1).limit(limit)
    messages = []
    async for msg in cursor:
        msg['_id'] = str(msg['_id'])
        msg['timestamp'] = msg['timestamp'].isoformat()
        messages.append(msg)
    return messages

async def get_user_messages(username: str, limit: int = 100):
    cursor = message_collection.find({
        "$or": [{"sender": username}, {"receiver": username}]
    }).sort("timestamp", 1).limit(limit)
    return await cursor.to_list(length=limit)

async def get_last_messages(username: str, limit: int = 10):
    cursor = message_collection.find({
        "$or": [{"sender": username}, {"receiver": username}]
    }).sort("timestamp", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_user_chats(username: str) -> list[dict]:
    """
    Возвращает список чатов пользователя с последним сообщением и временем
    Формат возвращаемых данных:
    [
        {
            "username": "имя_собеседника",
            "last_message": "текст последнего сообщения",
            "last_time": "время последнего сообщения в ISO формате"
        },
        ...
    ]
    """
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender": username},
                    {"receiver": username}
                ]
            }
        },
        {
            "$sort": {"timestamp": -1}  # Сначала сортируем по времени
        },
        {
            "$group": {
                "_id": {
                    "$cond": [
                        {"$eq": ["$sender", username]},
                        "$receiver",
                        "$sender"
                    ]
                },
                "last_message": {"$first": "$text"},
                "last_time": {"$first": "$timestamp"},
                # Дополнительно можно добавить флаг, кто отправил последнее сообщение
                "is_my_last_message": {
                    "$first": {
                        "$eq": ["$sender", username]
                    }
                }
            }
        },
        {
            "$project": {
                "username": "$_id",
                "last_message": 1,
                "last_time": 1,
                "is_my_last_message": 1,
                "_id": 0
            }
        },
        {
            "$sort": {"last_time": -1}  # Сортируем чаты по времени последнего сообщения
        }
    ]
    
    chats = await message_collection.aggregate(pipeline).to_list(None)
    
    # Конвертируем datetime в строку
    for chat in chats:
        chat["last_time"] = chat["last_time"].isoformat()
    
    return chats