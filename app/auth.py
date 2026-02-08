# auth.py
"""
Модуль для работы с аутентификацией и авторизацией.
Все функции содержат заглушки для последующей реализации.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt

from app.db import get_db
from app.models import User, Role
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY = "change_me_to_env"  # лучше брать из env/config
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(prefix="/auth", tags=["auth"])

def require_auth(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Зависимость, возвращающая текущего аутентифицированного пользователя.
    Бросает 401, если токен невалиден/протух или пользователь не найден.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось подтвердить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user

# ============== Эндпоинты аутентификации ==============

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверка уникальности логина
    existing_login = db.query(User).filter(User.login == user_data.login).first()
    if existing_login:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким логином уже существует",
        )

    # Проверка уникальности email
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # Хешируем пароль
    password_hash = hash_password(user_data.password)

    user_role = db.query(Role).filter(Role.name == 'user').first()
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Роль 'user' не найдена в системе",
        )

    # Создаем пользователя (по умолчанию активный, без роли / роль задашь позже)
    new_user = User(
        login=user_data.login,
        email=user_data.email,
        password_hash=password_hash,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        is_active=True,
        role_id=user_role.role_id,
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # На случай гонки/параллельных запросов
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким логином или email уже существует",
        )

    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Авторизация пользователя (возврат JWT токена)."""
    user = authenticate_user(db, credentials.login, credentials.password)
    if not user:
        # Не раскрываем, что именно не так: логин или пароль
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id), "login": user.login, "role_id": user.role_id},
        expires_delta=access_token_expires,
    )

    # FastAPI сам прогонит user через UserResponse благодаря from_attributes
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(require_auth)):
    """
    Выход из системы.
    Для JWT без серверной сессии — просто проверяем токен,
    дальше фронт удаляет токен у себя.
    """
    return {"message": "Logged out"}

# ============== Утилиты аутентификации ==============


def hash_password(password: str) -> str:
    """Хэширование пароля с использованием bcrypt."""
    pw_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля пользователя."""
    pw_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pw_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создание JWT токена для аутентификации.
    """
    to_encode = data.copy()

    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Декодирование и валидация JWT токена.
    Возвращает payload или None, если токен невалиден/протух.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def authenticate_user(db: Session, login: str, password: str) -> User | None:
    """Аутентификация пользователя по логину и паролю."""
    user = db.query(User).filter(User.login == login).first()
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user