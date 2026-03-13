# db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://wiki_user:wikidb@localhost:5432/wiki")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Dependency для FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
