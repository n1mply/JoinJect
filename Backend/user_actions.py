from fastapi import HTTPException, APIRouter, Depends, Request
from jose import jwt
from database import get_userdata_by_name
from config import SECRET_KEY, ALGORITHM

user_router = APIRouter()

@user_router.get('/user/{name}')
async def get_user_by_name(name: str, request: Request):
    print(f"Searching for user: {name}")
    
    # Получаем данные пользователя
    user_data = await get_userdata_by_name(name)
    if not user_data or 'error' in user_data:
        raise HTTPException(status_code=404, detail='User not found!')
    
    # Проверяем, является ли текущий пользователь владельцем профиля
    is_owner = False
    token = request.cookies.get("access_token")
    
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_username = payload.get("sub")
            is_owner = (current_username == name)
        except (jwt.JWTError, jwt.ExpiredSignatureError):
            pass  # Токен невалиден, но это не ошибка (is_owner останется False)
    
    return {
        'user_data': user_data,
        'is_owner': is_owner  # Добавляем флаг владельца
    }