# app/dashboard_stats.py

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models
from app.db import get_db


router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


# Pydantic-схема ответа
from pydantic import BaseModel, ConfigDict


class DashboardStats(BaseModel):
    # Статьи
    articles_total: int
    articles_delta_week: int

    # Посетители (пока заглушки, потом реализуем)
    visitors_total: int | None = None
    visitors_delta_week: float | None = None

    # Комментарии
    comments_total: int
    comments_delta_week: int

    # Реакции (суммарно по статьям и комментариям)
    likes_total: int
    dislikes_total: int
    likes_delta_week: int
    dislikes_delta_week: int


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    """
    Агрегированная статистика для главного экрана (дашборда).
    """
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # --- Статьи ---
    articles_total = db.query(models.Article).count()
    articles_delta_week = (
        db.query(models.Article)
        .filter(models.Article.created_at >= week_ago)
        .count()
    )

    # --- Комментарии ---
    comments_total = db.query(models.Comment).count()
    comments_delta_week = (
        db.query(models.Comment)
        .filter(models.Comment.created_at >= week_ago)
        .count()
    )

    # --- Реакции (лайки/дизлайки) ---
    likes_total = (
        db.query(models.Rating)
        .filter(models.Rating.type == "like")
        .count()
    )
    dislikes_total = (
        db.query(models.Rating)
        .filter(models.Rating.type == "dislike")
        .count()
    )

    likes_delta_week = (
        db.query(models.Rating)
        .filter(
            models.Rating.type == "like",
            models.Rating.created_at >= week_ago,
        )
        .count()
    )
    dislikes_delta_week = (
        db.query(models.Rating)
        .filter(
            models.Rating.type == "dislike",
            models.Rating.created_at >= week_ago,
        )
        .count()
    )

    # --- Посетители (просмотры статей) ---
    visitors_total = db.query(func.coalesce(func.sum(models.Article.view_count), 0)).scalar()
    visitors_delta_week = None  # честную дельту посчитаем, когда заведём логи просмотров

    return DashboardStats(
        articles_total=articles_total,
        articles_delta_week=articles_delta_week,
        visitors_total=visitors_total,
        visitors_delta_week=visitors_delta_week,
        comments_total=comments_total,
        comments_delta_week=comments_delta_week,
        likes_total=likes_total,
        dislikes_total=dislikes_total,
        likes_delta_week=likes_delta_week,
        dislikes_delta_week=dislikes_delta_week,
    )

class NewArticleItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    article_id: int
    title: str
    author_id: int
    author_name: str
    published_at: datetime | None = None
    created_at: datetime
    likes_count: int
    dislikes_count: int
    view_count: int
    
@router.get("/new-articles", response_model=list[NewArticleItem])
def get_new_articles(db: Session = Depends(get_db)) -> list[NewArticleItem]:
    """
    Три самые новые опубликованные статьи для блока New articles.
    """
    q = (
        db.query(models.Article, models.User)
        .join(models.User, models.Article.author_id == models.User.user_id)
        .filter(models.Article.is_published.is_(True))
        .order_by(
            models.Article.published_at.desc().nullslast(),
            models.Article.created_at.desc(),
        )
        .limit(3)
    )

    rows = q.all()

    result: list[NewArticleItem] = []
    for article, user in rows:
        result.append(
            NewArticleItem(
                article_id=article.article_id,
                title=article.title,
                author_id=user.user_id,
                author_name=(
                    f"{user.first_name} {user.last_name}".strip()
                    or user.login
                ),
                published_at=article.published_at,
                created_at=article.created_at,
                likes_count=article.likes_count,
                dislikes_count=article.dislikes_count,
                view_count=article.view_count,
            )
        )

    return result

class TopAuthorItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    author_id: int
    author_name: str

    articles_count: int
    articles_share_percent: float

    comments_count: int            # комментарии под его статьями
    reactions_received: int        # лайки+дизлайки на его статьях и комментариях


@router.get("/top-authors", response_model=list[TopAuthorItem])
def get_top_authors(db: Session = Depends(get_db)) -> list[TopAuthorItem]:
    """
    Топ-3 автора по количеству статей.
    Для каждого:
    - количество статей;
    - доля от общего числа статей;
    - количество комментариев под его статьями;
    - суммарные реакции (лайки/дизлайки) на его статьи и комментарии.
    """
    # всего опубликованных статей
    articles_total = (
        db.query(models.Article)
        .filter(models.Article.is_published.is_(True))
        .count()
    )
    if articles_total == 0:
        return []

    # топ-3 автора по количеству опубликованных статей
    top_authors_rows = (
        db.query(
            models.User.user_id.label("author_id"),
            models.User.first_name,
            models.User.last_name,
            models.User.login,
            func.count(models.Article.article_id).label("articles_count"),
        )
        .join(models.Article, models.Article.author_id == models.User.user_id)
        .filter(models.Article.is_published.is_(True))
        .group_by(models.User.user_id, models.User.first_name, models.User.last_name, models.User.login)
        .order_by(func.count(models.Article.article_id).desc())
        .limit(3)
        .all()
    )

    author_ids = [row.author_id for row in top_authors_rows]
    if not author_ids:
        return []

    # комментарии под статьями этих авторов
    comments_rows = (
        db.query(
            models.Article.author_id.label("author_id"),
            func.count(models.Comment.comment_id).label("comments_count"),
        )
        .join(models.Article, models.Comment.article_id == models.Article.article_id)
        .filter(models.Article.author_id.in_(author_ids))
        .group_by(models.Article.author_id)
        .all()
    )
    comments_by_author = {row.author_id: row.comments_count for row in comments_rows}

    # реакции на статьи этих авторов
    article_reactions_rows = (
        db.query(
            models.Article.author_id.label("author_id"),
            func.count(models.Rating.reaction_id).label("reactions_count"),
        )
        .join(
            models.Rating,
            (models.Rating.reactionable_type == "article")
            & (models.Rating.reactionable_id == models.Article.article_id),
        )
        .filter(models.Article.author_id.in_(author_ids))
        .group_by(models.Article.author_id)
        .all()
    )
    article_reactions_by_author = {
        row.author_id: row.reactions_count for row in article_reactions_rows
    }

    # реакции на комментарии этих авторов
    comment_reactions_rows = (
        db.query(
            models.Comment.author_id.label("author_id"),
            func.count(models.Rating.reaction_id).label("reactions_count"),
        )
        .join(
            models.Rating,
            (models.Rating.reactionable_type == "comment")
            & (models.Rating.reactionable_id == models.Comment.comment_id),
        )
        .filter(models.Comment.author_id.in_(author_ids))
        .group_by(models.Comment.author_id)
        .all()
    )
    comment_reactions_by_author = {
        row.author_id: row.reactions_count for row in comment_reactions_rows
    }

    result: list[TopAuthorItem] = []
    for row in top_authors_rows:
        author_id = row.author_id
        articles_count = row.articles_count

        articles_share_percent = (
            articles_count / articles_total * 100.0 if articles_total > 0 else 0.0
        )

        comments_count = comments_by_author.get(author_id, 0)
        reactions_received = (
            article_reactions_by_author.get(author_id, 0)
            + comment_reactions_by_author.get(author_id, 0)
        )

        author_name = (
            f"{row.first_name} {row.last_name}".strip()
            or row.login
        )

        result.append(
            TopAuthorItem(
                author_id=author_id,
                author_name=author_name,
                articles_count=articles_count,
                articles_share_percent=round(articles_share_percent, 1),
                comments_count=comments_count,
                reactions_received=reactions_received,
            )
        )

    return result
