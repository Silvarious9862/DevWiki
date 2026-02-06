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


# ============== Статьи (Articles) ==============

@app.get("/articles", response_model=List[ArticleListItem])
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    author_id: Optional[int] = None,
    is_published: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Получение списка статей с фильтрацией и пагинацией.
    Доступно всем пользователям (включая анонимных).
    """
    pass


@app.get("/articles/search", response_model=List[ArticleListItem])
async def search_articles(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Поиск статей по названию"""
    pass


@app.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Получение статьи по ID.
    Инкрементирует счетчик просмотров.
    """
    pass


@app.post("/articles", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_data: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Создание новой статьи (требует авторизации)"""
    pass


@app.put("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    article_data: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Редактирование статьи (только автор может редактировать)"""
    pass


@app.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Удаление статьи (только автор или модератор)"""
    pass


@app.patch("/articles/{article_id}/publish", response_model=ArticleResponse)
async def publish_article(
    article_id: int,
    publish_data: ArticlePublishUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    """Публикация или скрытие статьи (только модератор)"""
    pass


# ============== Комментарии (Comments) ==============

@app.get("/articles/{article_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    article_id: int,
    db: Session = Depends(get_db)
):
    """Получение списка комментариев к статье"""
    pass


@app.post("/articles/{article_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    article_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Создание комментария к статье (требует авторизации)"""
    pass


@app.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Редактирование комментария (только автор)"""
    pass


@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Удаление комментария (автор или модератор)"""
    pass


# ============== Рейтинги (Likes/Dislikes) ==============

@app.post("/articles/{article_id}/like", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def like_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Поставить лайк статье"""
    pass


@app.post("/articles/{article_id}/dislike", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def dislike_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Поставить дизлайк статье"""
    pass


@app.delete("/articles/{article_id}/reaction", status_code=status.HTTP_204_NO_CONTENT)
async def remove_article_reaction(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Удалить свою реакцию со статьи"""
    pass


@app.post("/comments/{comment_id}/like", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Поставить лайк комментарию"""
    pass


@app.post("/comments/{comment_id}/dislike", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def dislike_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Поставить дизлайк комментарию"""
    pass


@app.delete("/comments/{comment_id}/reaction", status_code=status.HTTP_204_NO_CONTENT)
async def remove_comment_reaction(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Удалить свою реакцию с комментария"""
    pass


# ============== Категории и Теги ==============

@app.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: Session = Depends(get_db)):
    """Получение списка всех категорий"""
    pass


@app.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    """Создание новой категории (только модератор)"""
    pass


@app.get("/tags", response_model=List[TagResponse])
async def list_tags(db: Session = Depends(get_db)):
    """Получение списка всех тегов"""
    pass


@app.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Создание нового тега (требует авторизации)"""
    pass


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
