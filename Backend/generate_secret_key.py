import hashlib
import secrets


def generate_secret_key():
    random_bytes = secrets.token_bytes(32)  # Генерируем случайные 32 байта
    return hashlib.sha256(random_bytes).hexdigest()  # Возвращаем хэш от этих байтов