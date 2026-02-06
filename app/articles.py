# /app/articles.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import get_db
from app.dependencies import get_current_user, get_optional_current_user, require_moderator
from app.models import User

router = APIRouter(
    prefix="/articles",
    tags=["articles"],
)

# ========== Эндпоинты ==========

@router.get(
    "",
    response_model=List[schemas.ArticleListItem],
)
def list_articles(
    query: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    author_id: Optional[int] = Query(None),
    tag_ids: Optional[List[int]] = Query(None),   # пока игнорируем в реализации
    is_published: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    GET /articles — список статей с пагинацией и фильтрами.
    Доступен анонимно. Обычный пользователь видит только опубликованные статьи.
    Модератор может дополнительно фильтровать по is_published.
    """
    q = db.query(models.Article)

    # Определяем, модератор ли
    is_moderator = (
        current_user is not None
        and current_user.role is not None
        and current_user.role.name == "moderator"
    )

    if not is_moderator:
        # Анонимы и обычные пользователи видят только опубликованные
        q = q.filter(models.Article.is_published.is_(True))
    else:
        # Модератор может фильтровать по is_published, если параметр задан
        if is_published is not None:
            q = q.filter(models.Article.is_published == is_published)

    # Поиск по строке (title + content)
    if query:
        like_expr = f"%{query}%"
        q = q.filter(
            or_(
                models.Article.title.ilike(like_expr),
                models.Article.content.ilike(like_expr),
            )
        )

    # Фильтр по категории
    if category_id is not None:
        q = q.filter(models.Article.category_id == category_id)

    # Фильтр по автору
    if author_id is not None:
        q = q.filter(models.Article.author_id == author_id)

    # Пагинация
    offset = (page - 1) * limit
    q = q.order_by(models.Article.created_at.desc())
    articles = q.offset(offset).limit(limit).all()

    return articles or []

@router.get(
    "/{article_id}",
    response_model=schemas.ArticleResponse,
)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    GET /articles/{id} — детальная статья.
    Аноним/обычный пользователь: только опубликованные статьи.
    Модератор: может видеть также неопубликованные.
    """
    article = db.query(models.Article).filter(
        models.Article.article_id == article_id
    ).first()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    is_moderator = (
        current_user is not None
        and current_user.role is not None
        and current_user.role.name == "moderator"
    )

    # Если статья не опубликована, доступ только модератору
    if not article.is_published and not is_moderator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    # Простейший учёт просмотра (без таймаута/уникальности)
    article.view_count = (article.view_count or 0) + 1
    db.add(article)
    db.commit()
    db.refresh(article)

    return article


@router.post(
    "",
    response_model=schemas.ArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_article(
    article_data: schemas.ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator),
):
    """POST /articles — создание статьи (только модератор)."""
    # TODO: создать Article, привязать author_id = current_user.user_id
    raise NotImplementedError


@router.put(
    "/{article_id}",
    response_model=schemas.ArticleResponse,
)
def update_article(
    article_id: int,
    article_data: schemas.ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator),
):
    """PUT /articles/{id} — обновление статьи (только модератор)."""
    # TODO: найти статью, обновить поля, сохранить
    raise NotImplementedError


@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator),
):
    """DELETE /articles/{id} — удаление статьи (только модератор)."""
    # TODO: удалить/пометить удалённой
    raise NotImplementedError
