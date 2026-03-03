# main.py
import os
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app.articles import router as articles_router
from app.auth import router as auth_router
from app.db import get_db
from app.health import check_app, check_db, check_front
from app.health import router as health_router
from app.models import User, Article, Comment, Category, Tag, Attachment, Rating
from app.ratings import router as ratings_router
from app.tags import router as tags_router
from app.comments import router as comments_router
from app.users import router as users_router
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListItem, ArticleSearchParams, ArticlePublishUpdate,
    CommentCreate, CommentUpdate, CommentResponse,
    CategoryCreate, CategoryResponse,
    TagCreate, TagResponse,
    AttachmentResponse,
    RatingCreate, RatingResponse,
    PaginationParams
)
from app.dependencies import get_current_user, require_auth, require_moderator, get_optional_current_user

app = FastAPI(title="Dev Wiki API", version="0.1.1")
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(ratings_router)
app.include_router(tags_router)
app.include_router(comments_router)
app.include_router(users_router)

# Создаём папку uploads если её нет
os.makedirs("uploads", exist_ok=True)

# Отдача статических файлов (картинок)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # если фронт работает локально
        "http://192.168.100.30:3000"   # если фронт на отдельной VM
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Обработка ошибок ==============

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    """Кастомный обработчик 404 ошибок"""
    detail = exc.detail or "Not Found"

    return JSONResponse(
        status_code=404,
        content={
            "detail": detail,
            "requested_path": str(request.url.path),
            "message": "Запрошенный ресурс не найден"
        }
    )



# ============== Вложения (Attachments) ==============

@app.post("/articles/{article_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    article_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Загрузка файла к статье"""
    pass


@app.get("/articles/{article_id}/attachments", response_model=List[AttachmentResponse])
async def list_attachments(
    article_id: int,
    db: Session = Depends(get_db)
):
    """Получение списка файлов статьи"""
    pass


@app.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Удаление файла (автор статьи или модератор)"""
    pass
