# app/categories.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.dependencies import get_db
from app.models import Category

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)


@router.get("/resolve-category")
def resolve_category(
    name: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    like_expr = f"%{name}%"

    category = (
        db.query(Category)
        .filter(Category.description.ilike(like_expr))
        .order_by(Category.category_id)
        .first()
    )

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"id": category.category_id}
