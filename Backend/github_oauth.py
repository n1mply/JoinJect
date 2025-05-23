from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import RedirectResponse
import httpx
import logging
from routers.access_token_router import create_access_token
from database import create_user_from_github
from config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI

logger = logging.getLogger(__name__)
github_router = APIRouter()

@github_router.get("/auth/github")
async def github_auth():
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri={GITHUB_REDIRECT_URI}&scope=user:email"
    )

@github_router.get("/auth/github/callback")
async def github_callback(code: str, response: Response):
    print(code)
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": GITHUB_REDIRECT_URI,
                },
            )
            token_data = token_response.json()
            logger.debug(f"GitHub token response: {token_data}")
            
            if "error" in token_data:
                error_msg = f"GitHub error: {token_data['error']}"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
            
            access_token = token_data.get("access_token")
            if not access_token:
                error_msg = "No access token received from GitHub"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)

            # Получаем основную информацию о пользователе
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_response.json()
            logger.debug(f"GitHub user data: {user_data}")
            
            username = user_data.get("login")
            if not username:
                error_msg = "GitHub user data missing login"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)

            # Получаем email пользователя (дополнительный запрос)
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            emails_data = emails_response.json()
            logger.debug(f"GitHub emails data: {emails_data}")

            # Находим основной email (первичный и подтвержденный)
            email = None
            if isinstance(emails_data, list):
                primary_email = next((e for e in emails_data if e.get("primary") and e.get("verified")), None)
                if primary_email:
                    email = primary_email["email"]
                elif emails_data:
                    email = emails_data[0]["email"]

            user = {
                "username": username,
                "mail": email or f"{username}@no-email.com",  # fallback если email не найден
                "services": ['github',],
            }
            print(user)
            result = await create_user_from_github(user)
            
            if "error" in result:
                logger.error(f"Database error: {result['error']}")
                raise HTTPException(status_code=500, detail=result["error"])

            jwt_token = create_access_token({"sub": username})
            logger.info(f"Successfully authenticated user: {username}")

            response.set_cookie(
                key="access_token",
                value=jwt_token,
                httponly=True,
            )

            return {"message": "Authentication successful"}

    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")