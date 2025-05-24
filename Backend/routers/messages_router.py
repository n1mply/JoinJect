from fastapi import APIRouter, Cookie, HTTPException
from database.messages import get_messages_between_users
from .access_token_router import decode_access_token

msg_router = APIRouter()

@msg_router.get("/messages/{other_user}")
async def get_chat_history(
    other_user: str, 
    access_token: str = Cookie(None, alias="access_token")
):
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        current_user = decode_access_token(access_token)
        chat_history = await get_messages_between_users(current_user, other_user)
        return {'history': chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))