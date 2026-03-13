# app/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app import models, schemas
from app.dependencies import get_db
from app.models import User

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/resolve-author")
def resolve_author(
    name: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    q = db.query(User)

    like_expr = f"%{name}%"
    user = (
        q.filter(
            or_(
                User.login.ilike(like_expr),
                (User.first_name + " " + User.last_name).ilike(like_expr),
            )
        )
        .order_by(User.user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="Author not found")

    return {"id": user.user_id}

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.user_id == user_id)
        .first()
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    return user