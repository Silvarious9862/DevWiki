import os
import sys

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from app.db import Base, get_db
from app.main import app

# обеспечиваем импорт пакета app при запуске pytest из корня
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

TEST_DATABASE_URL = "postgresql+psycopg2://wiki_user:wikidb@192.168.100.10:5432/wiki_test"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture(scope="function")
def client(db_session: Session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass 

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c