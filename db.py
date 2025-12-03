# db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # импортируем Base из models.py

DATABASE_URL = "postgresql://wiki_user:wikidb@192.168.100.10:5432/wiki"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создание таблиц (на этапе разработки)
Base.metadata.create_all(bind=engine)

# Dependency для FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
