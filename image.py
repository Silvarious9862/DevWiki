# image.py
import os
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models import Image, Article  # предполагаем, что модели описаны в models.py

UPLOAD_DIR = "uploads"

def ensure_article_dir(slug: str) -> str:
    """Создаёт папку для статьи по её slug, если её нет."""
    article_dir = os.path.join(UPLOAD_DIR, slug)
    os.makedirs(article_dir, exist_ok=True)
    return article_dir

def save_image(file: UploadFile, slug: str, article_id: int, db: Session) -> Image:
    """Сохраняет картинку в папку по slug и добавляет запись в БД."""
    article_dir = ensure_article_dir(slug)
    file_path = os.path.join(article_dir, file.filename)

    # Сохраняем файл на диск
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Создаём запись в БД
    image = Image(
        article_id=article_id,
        filename=file.filename,
        file_path=f"/static/{slug}/{file.filename}",
        mime_type=file.content_type
    )
    db.add(image)
    db.commit()
    db.refresh(image)

    return image

def get_images_for_article(article_id: int, db: Session) -> list[Image]:
    """Возвращает список картинок для статьи."""
    return db.query(Image).filter(Image.article_id == article_id).all()
