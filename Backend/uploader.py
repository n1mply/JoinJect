import os
from fastapi import HTTPException, UploadFile
from uuid import uuid4
from PIL import Image
import io

AVATARS_DIR = "static/avatars"
TARGET_SIZE = (200, 200)
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_FILE_SIZE = 5 * 1024 * 1024

os.makedirs(AVATARS_DIR, exist_ok=True)

async def save_avatar(username: str, file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG/PNG/WEBP images allowed")

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large (max 5MB)")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')

        image.thumbnail(TARGET_SIZE, Image.LANCZOS)

        file_ext = "jpg" if file.content_type in ["image/jpeg"] else "webp"
        filename = f"{username}_{uuid4().hex}.{file_ext}"
        file_path = os.path.join(AVATARS_DIR, filename)

        with open(file_path, "wb") as f:
            image.save(
                f,
                format='WEBP' if file_ext == 'webp' else 'JPEG',
                quality=85,
                optimize=True
            )
        return filename
    
    except Exception as e:
        raise HTTPException(500, f"Image processing failed: {str(e)}")