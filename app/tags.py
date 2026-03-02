# app/tags.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import get_db
from app.dependencies import require_moderator
from app.models import Tag, ArticleTag

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)

@router.get("", response_model=List[schemas.TagResponse])
def list_tags(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    tags = db.query(Tag).order_by(Tag.name).offset(offset).limit(limit).all()
    return tags

@router.get("/with-counts", response_model=List[schemas.TagWithCountResponse])
def list_tags_with_counts(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    
    tags = (
        db.query(
            Tag,
            func.count(ArticleTag.article_id).label("articles_count")
        )
        .outerjoin(ArticleTag, ArticleTag.tag_id == Tag.tag_id)
        .group_by(Tag.tag_id)
        .order_by(Tag.name)
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    return [
        schemas.TagWithCountResponse(
            tag_id=tag.tag_id,
            name=tag.name,
            created_at=tag.created_at,
            articles_count=count
        )
        for tag, count in tags
    ]

@router.get("/bulk", response_model=List[schemas.TagResponse])
def get_tags_bulk(
    ids: List[int] = Query(..., description="ID тегов для выборки"),
    db: Session = Depends(get_db),
):
    """
    GET /tags/bulk?ids=1&ids=2&ids=3
    Возвращает список тегов по списку id.
    """
    if not ids:
        return []

    tags = (
        db.query(Tag)
        .filter(Tag.tag_id.in_(ids))
        .order_by(Tag.name)
        .all()
    )
    return tags

@router.get("/{tag_id}", response_model=schemas.TagResponse)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.tag_id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тег не найден")
    return tag

@router.post("", response_model=schemas.TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_data: schemas.TagCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_moderator)
):
    existing = db.query(Tag).filter(Tag.name == tag_data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Тег уже существует")
    
    tag = Tag(name=tag_data.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@router.put("/{tag_id}", response_model=schemas.TagResponse)
def update_tag(
    tag_id: int,
    tag_data: schemas.TagUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_moderator)
):
    tag = db.query(Tag).filter(Tag.tag_id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тег не найден")
    
    existing = db.query(Tag).filter(Tag.name == tag_data.name, Tag.tag_id != tag_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Тег с таким именем уже существует")
    
    tag.name = tag_data.name
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_moderator)
):
    tag = db.query(Tag).filter(Tag.tag_id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тег не найден")
    
    db.delete(tag)
    db.commit()

@router.get("/{tag_id}/articles", response_model=List[schemas.ArticleListItem])
def get_articles_by_tag(
    tag_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    tag = db.query(Tag).filter(Tag.tag_id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тег не найден")
    
    offset = (page - 1) * limit
    
    articles = (
        db.query(models.Article)
        .join(ArticleTag, ArticleTag.article_id == models.Article.article_id)
        .filter(ArticleTag.tag_id == tag_id, models.Article.is_published == True)
        .order_by(models.Article.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    return articles

