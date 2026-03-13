# app/ratings.py
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


def _get_target_model(reactionable_type: str):
    if reactionable_type == "article":
        return models.Article
    if reactionable_type == "comment":
        return models.Comment
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Неверный тип сущности для реакции",
    )


@router.post(
    "/{reactionable_type}/{reactionable_id}",
    response_model=schemas.RatingToggleResponse,
)
def toggle_rating(
    reactionable_type: str,
    reactionable_id: int,
    payload: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Универсальный переключатель лайк/дизлайк
    - reactionable_type: article | comment
    - reactionable_id: id статьи или комментария
    """
    if payload.type not in ("like", "dislike"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный тип реакции",
        )

    Model = _get_target_model(reactionable_type)

    target = (
        db.query(Model)
        .filter(
            Model.article_id == reactionable_id
            if reactionable_type == "article"
            else Model.comment_id == reactionable_id
        )
        .first()
    )
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сущность не найдена",
        )

    existing = (
        db.query(models.Rating)
        .filter(
            models.Rating.reactionable_type == reactionable_type,
            models.Rating.reactionable_id == reactionable_id,
            models.Rating.user_id == current_user.user_id,
        )
        .first()
    )

    # 1) не было реакции -> создаём
    # 2) была такая же -> снимаем
    # 3) была другая -> меняем type
    if existing is None:
        rating = models.Rating(
            reactionable_type=reactionable_type,
            reactionable_id=reactionable_id,
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
            models.Rating.reactionable_type == reactionable_type,
            models.Rating.reactionable_id == reactionable_id,
            models.Rating.type == "like",
        )
        .count()
    )
    dislikes_count = (
        db.query(models.Rating)
        .filter(
            models.Rating.reactionable_type == reactionable_type,
            models.Rating.reactionable_id == reactionable_id,
            models.Rating.type == "dislike",
        )
        .count()
    )

    # Обновляем агрегаты у статьи или комментария
    target.likes_count = likes_count
    target.dislikes_count = dislikes_count
    db.add(target)
    db.commit()

    return schemas.RatingToggleResponse(
        likes_count=likes_count,
        dislikes_count=dislikes_count,
        user_reaction=user_reaction,
    )
