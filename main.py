import os
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from health import check_app, check_db, check_front
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from image import save_image, get_images_for_article
from db import get_db
from models import Article
from utils import slugify

app = FastAPI()

# Создаём папку uploads если её нет
os.makedirs("uploads", exist_ok=True)

# Отдача статических файлов (картинок)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # если фронт работает локально
        "http://192.168.100.30:3000"   # если фронт на отдельной VM
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    app_status = await check_app()
    db_status = check_db()
    front_status = await check_front()

    return {
        "system": "wiki",
        "app": app_status,
        "db": db_status,
        "front": front_status
    }

def get_article_id_by_slug(slug: str, db: Session) -> int:
    """Получает id статьи по её slug или возвращает 404."""
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    return article.id

@app.post("/articles/{slug}/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_image(slug: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    article_id = get_article_id_by_slug(slug, db)
    image = save_image(file, slug, article_id, db)
    return {
        "message": "Файл загружен",
        "url": image.file_path,
        "markdown": f"![{file.filename}]({image.file_path})"
    }

@app.get("/articles/{slug}/images")
def list_images(slug: str, db: Session = Depends(get_db)):
    article_id = get_article_id_by_slug(slug, db)
    images = get_images_for_article(article_id, db)
    return [{"filename": img.filename, "url": img.file_path} for img in images]

class ArticleCreate(BaseModel):
    title: str
    content: str

@app.post("/articles/", status_code=status.HTTP_201_CREATED)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    base_slug = slugify(article.title)
    slug = base_slug
    counter = 2
    while db.query(Article).filter(Article.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    new_article = Article(
        title=article.title,
        slug=slug,
        content=article.content
    )
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return {"id": new_article.id, "slug": new_article.slug, "title": new_article.title}

@app.get("/articles/{slug}")
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "content": article.content,
        "created_at": article.created_at,
        "updated_at": article.updated_at
    }

class ArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

@app.put("/articles/{slug}", status_code=status.HTTP_200_OK)
def update_article(slug: str, update: ArticleUpdate, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")

    if update.title is not None:
        article.title = update.title
        article.slug = slugify(update.title)

    if update.content:
        article.content = update.content

    db.commit()
    db.refresh(article)
    return article

@app.delete("/articles/{slug}")
def delete_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")

    db.delete(article)
    db.commit()
    return {"message": f"Статья '{slug}' удалена"}