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
