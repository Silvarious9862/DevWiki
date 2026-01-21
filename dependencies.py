# dependencies.py
"""
FastAPI зависимости для проверки аутентификации и авторизации.
Все функции содержат заглушки для последующей реализации.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db import get_db
from models import User

# OAuth2 схема для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Получение текущего пользователя из JWT токена.
    
    Args:
        token: JWT токен из заголовка Authorization
        db: Сессия БД
        
    Returns:
        Объект User текущего пользователя
        
    Raises:
        HTTPException: 401 если токен невалиден или пользователь не найден
    """
    pass


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Проверка что текущий пользователь активен.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        Объект User если пользователь активен
        
    Raises:
        HTTPException: 403 если пользователь неактивен
    """
    pass


async def require_auth(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Требование авторизации для эндпоинта.
    Алиас для get_current_active_user для более явного названия.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        Объект User
        
    Raises:
        HTTPException: 401 если пользователь не авторизован
    """
    pass


async def require_moderator(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Требование роли модератора для эндпоинта.
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        Объект User если у пользователя есть права модератора
        
    Raises:
        HTTPException: 403 если у пользователя нет прав модератора
    """
    pass


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Получение текущего пользователя если он авторизован (опционально).
    Используется для эндпоинтов, которые работают как для авторизованных,
    так и для неавторизованных пользователей.
    
    Args:
        token: JWT токен из заголовка Authorization (опционально)
        db: Сессия БД
        
    Returns:
        Объект User если пользователь авторизован, None иначе
    """
    pass

