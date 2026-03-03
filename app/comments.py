# app/routers/comments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(
    prefix="/comments",
    tags=["comments"],
)


def build_tree(rows: list[models.Comment]) -> list[schemas.CommentTreeItem]:
    by_id: dict[int, schemas.CommentTreeItem] = {}
    roots: list[schemas.CommentTreeItem] = []

    # сначала превратим в DTO без children
    for c in rows:
        item = schemas.CommentTreeItem(
            comment_id=c.comment_id,
            text=c.text,
            article_id=c.article_id,
            author_id=c.author_id,
            parent_id=getattr(c, "parent_id", None),
            depth=getattr(c, "depth", 0),
            likes_count=c.likes_count,
            dislikes_count=c.dislikes_count,
            created_at=c.created_at,
            updated_at=c.updated_at,
            children=[],
        )
        by_id[c.comment_id] = item

    # собираем дерево
    for item in by_id.values():
        if item.parent_id is None:
            roots.append(item)
        else:
            parent = by_id.get(item.parent_id)
            if parent:
                parent.children.append(item)
            else:
                roots.append(item)

    return roots


@router.get(
    "/articles/{article_id}",
    response_model=list[schemas.CommentTreeItem],
)
def list_article_comments(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    Комментарии к статье:
    - доступны всем;
    - сортировка по дате создания;
    - вложенность до 7 уровней обеспечивается на стадии создания.
    """
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

    comments = (
        db.query(models.Comment)
        .filter(models.Comment.article_id == article_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )

    return build_tree(comments)


@router.post(
    "/articles/{article_id}",
    response_model=schemas.CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    article_id: int,
    payload: schemas.CommentCreate,
    parent_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Создать комментарий к статье.
    - Только авторизованный пользователь;
    - если передан parent_id, проверяем глубину <= 7.
    """
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

    depth = 0
    if parent_id is not None:
        parent = (
            db.query(models.Comment)
            .filter(
                models.Comment.comment_id == parent_id,
                models.Comment.article_id == article_id,
            )
            .first()
        )
        if parent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Родительский комментарий не найден",
            )
        if parent.depth >= 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Максимальная глубина вложенности комментариев достигнута",
            )
        depth = parent.depth + 1

    comment = models.Comment(
        text=payload.text,
        article_id=article_id,
        author_id=current_user.user_id,
        parent_id=parent_id,
        depth=depth,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return schemas.CommentResponse.model_validate(comment)


@router.patch(
    "/{comment_id}",
    response_model=schemas.CommentResponse,
)
def update_comment(
    comment_id: int,
    payload: schemas.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Обновление комментария.
    - Только автор/модератор (здесь проверяем только автора).
    """
    comment = (
        db.query(models.Comment)
        .filter(models.Comment.comment_id == comment_id)
        .first()
    )
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    if comment.author_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для редактирования комментария",
        )

    comment.text = payload.text
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return schemas.CommentResponse.model_validate(comment)


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Удаление комментария.
    - Только автор/модератор (здесь проверяем только автора).
    """
    comment = (
        db.query(models.Comment)
        .filter(models.Comment.comment_id == comment_id)
        .first()
    )
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    if comment.author_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления комментария",
        )

    db.delete(comment)
    db.commit()
