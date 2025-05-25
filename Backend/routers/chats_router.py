from fastapi import APIRouter, Cookie, HTTPException, Request
from .access_token_router import decode_access_token
from database.messages import get_user_chats

chats_router = APIRouter()


@chats_router.get('/chats/get')
async def get_chats(request: Request):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code=401, detail='Unauthorazed')
    try:
        username = decode_access_token(token)
        chats = await get_user_chats(username)
        print(chats)
        return {"chats": chats}
    except Exception as e:
        print(e)