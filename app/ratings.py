from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(
    prefix="/ratings",
    tags=["ratings"],
)


@router.post(
    "/articles/{article_id}",
    response_model=schemas.RatingToggleResponse,
)
def toggle_article_rating(
    article_id: int,
    payload: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.type not in ("like", "dislike"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный тип реакции",
        )

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

    existing = (
        db.query(models.Rating)
        .filter(
            models.Rating.reactionable_type == "article",
            models.Rating.reactionable_id == article_id,
            models.Rating.user_id == current_user.user_id,
        )
        .first()
    )

    # Логика:
    # 1) не было реакции -> создаём
    # 2) была такая же -> снимаем (toggle off)
    # 3) была другая -> меняем type
    if existing is None:
        rating = models.Rating(
            reactionable_type="article",
            reactionable_id=article_id,
            user_id=current_user.user_id,
            type=payload.type,
        )
        db.add(rating)
        user_reaction = payload.type
    else:
        if existing.type == payload.type:
            db.delete(existing)
            user_reaction = None
        else:
            existing.type = payload.type
            user_reaction = payload.type

    db.commit()

    # Пересчёт агрегатов
    likes_count = (
        db.query(models.Rating)
        .filter(
            models.Rating.reactionable_type == "article",
            models.Rating.reactionable_id == article_id,
            models.Rating.type == "like",
        )
        .count()
    )
    dislikes_count = (
        db.query(models.Rating)
        .filter(
            models.Rating.reactionable_type == "article",
            models.Rating.reactionable_id == article_id,
            models.Rating.type == "dislike",
        )
        .count()
    )

    article.likes_count = likes_count
    article.dislikes_count = dislikes_count
    db.add(article)
    db.commit()

    return schemas.RatingToggleResponse(
        likes_count=likes_count,
        dislikes_count=dislikes_count,
        user_reaction=user_reaction,
    )
