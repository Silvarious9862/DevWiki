# /app/articles.py

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.db import get_db
from app.dependencies import get_current_user, get_optional_current_user, require_moderator
from app.models import User, ArticleTag, Category

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
    tag_ids: Optional[List[int]] = Query(None),
    is_published: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    # базовый запрос сразу с join по автору
    q = (
        db.query(
            models.Article,
            User.login.label("author_login"),
            User.first_name.label("author_first_name"),
            User.last_name.label("author_last_name"),
            Category.description.label("category_name")
        )
        .join(User, User.user_id == models.Article.author_id)
        .outerjoin(Category, Category.category_id == models.Article.category_id)
    )

    is_moderator = (
        current_user is not None
        and current_user.role is not None
        and current_user.role.name == "moderator"
    )

    if not is_moderator:
        q = q.filter(models.Article.is_published.is_(True))
    else:
        if is_published is not None:
            q = q.filter(models.Article.is_published == is_published)

    if query:
        like_expr = f"%{query}%"
        q = q.filter(
            or_(
                models.Article.title.ilike(like_expr),
                models.Article.content.ilike(like_expr),
            )
        )

    if category_id is not None:
        q = q.filter(models.Article.category_id == category_id)

    if author_id is not None:
        q = q.filter(models.Article.author_id == author_id)

    if tag_ids:
        q = (
            q.join(ArticleTag, ArticleTag.article_id == models.Article.article_id)
            .filter(ArticleTag.tag_id.in_(tag_ids))
            .group_by(models.Article.article_id)
        )

    offset = (page - 1) * limit
    q = q.order_by(models.Article.created_at.desc())
    articles = q.offset(offset).limit(limit).all()

    rows = q.offset(offset).limit(limit).all()

    items: list[schemas.ArticleListItem] = []
    for article, author_login, author_first_name, author_last_name, category_name in rows:
        items.append(
            schemas.ArticleListItem(
                article_id=article.article_id,
                title=article.title,
                author_id=article.author_id,
                author_login=author_login,
                author_first_name=author_first_name,
                author_last_name=author_last_name,
                category_id=article.category_id,
                category_name=category_name,
                is_published=article.is_published,
                created_at=article.created_at,
                updated_at=article.updated_at,
                likes_count=article.likes_count,
                dislikes_count=article.dislikes_count,
                view_count=article.view_count,
            )
        )

    return items



@router.get(
    "/{article_id}",
    response_model=schemas.ArticleResponse,
)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    article = (
        db.query(models.Article)
        .options(joinedload(models.Article.category))
        .filter(models.Article.article_id == article_id)
        .first()
    )

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

    if not article.is_published and not is_moderator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    article.view_count = (article.view_count or 0) + 1
    db.add(article)
    db.commit()
    db.refresh(article)

    return schemas.ArticleResponse(
        **article.__dict__,
        category_name=(
            article.category.description
            if getattr(article, "category", None)
            else None
        ),
    )



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
    """
    POST /articles — создание статьи (только модератор).
    author_id берём из текущего пользователя.
    likes_count, dislikes_count, view_count и timestamps — по умолчанию из модели.
    """
    article = models.Article(
        title=article_data.title,
        content=article_data.content,
        author_id=current_user.user_id,
        category_id=article_data.category_id,
        is_published=article_data.is_published,
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    if article_data.tag_ids:
        for tag_id in article_data.tag_ids:
            db.add(ArticleTag(article_id=article.article_id, tag_id=tag_id))
        db.commit()
        db.refresh(article)

    return article


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

    article = db.query(models.Article).filter(
        models.Article.article_id == article_id
    ).first()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    # Обновляем только переданные поля
    if article_data.title is not None:
        article.title = article_data.title

    if article_data.content is not None:
        article.content = article_data.content

    if article_data.category_id is not None:
        article.category_id = article_data.category_id

    if article_data.is_published is not None:
        article.is_published = article_data.is_published
        # published_at можно обновлять по своему правилу:
        # если только что публикуем — ставим время
        if article.is_published and article.published_at is None:
            article.published_at = datetime.now()

    # Теги
    if article_data.tag_ids is not None:
        # Сначала удаляем старые связи
        db.query(ArticleTag).filter(
            ArticleTag.article_id == article.article_id
        ).delete()

        # Затем добавляем новые (если список не пустой)
        for tag_id in article_data.tag_ids:
            db.add(ArticleTag(article_id=article.article_id, tag_id=tag_id))
    
    db.add(article)
    db.commit()
    db.refresh(article)

    return article


@router.post(
    "/{article_id}/toggle-publish",
    response_model=schemas.ArticleResponse,
)
def toggle_article_publish(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator),
):
    article = (
        db.query(models.Article)
        .filter(models.Article.article_id == article_id)
        .first()
    )
    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    # Переключаем статус
    article.is_published = not bool(article.is_published)

    # Если только что опубликовали — установим published_at
    if article.is_published and article.published_at is None:
        article.published_at = datetime.now()
    # Если вернули в черновик — можно, при необходимости, сбросить published_at
    # else:
    #     article.published_at = None

    db.add(article)
    db.commit()
    db.refresh(article)

    return article


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

    article = db.query(models.Article).filter(
        models.Article.article_id == article_id
    ).first()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    db.delete(article)
    db.commit()
    # 204 — без тела ответа