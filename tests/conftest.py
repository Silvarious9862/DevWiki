import os
import sys
import pytest
import pathlib
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from app.db import Base, get_db
from app.main import app

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

TEST_DATABASE_URL = "postgresql+psycopg2://wiki_user:wikidb@192.168.100.10:5432/wiki_test"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    from app.models import Role
    
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        user_role = Role(name='user', description='Обычный пользователь системы')
        mod_role = Role(name='moderator', description='Модератор с расширенными правами')
        session.add(user_role)
        session.add(mod_role)
        session.commit()
    except:
        session.rollback()
    finally:
        session.close()
    
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

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

@pytest.fixture
def moderator_user(db_session):
    from app.models import User, Role
    from app.auth import hash_password
    
    # Проверяем существование
    existing = db_session.query(User).filter(
        User.login == 'test_moderator'
    ).first()
    
    if existing:
        return existing
    
    role = db_session.query(Role).filter(Role.name == 'moderator').first()
    user = User(
        login='test_moderator',
        email='moderator@test.local',
        password_hash=hash_password('test_pass_123'),
        first_name='Test',
        last_name='Moderator',
        role_id=role.role_id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_tag(db_session):
    from app.models import Tag
    
    # Проверяем существование
    existing = db_session.query(Tag).filter(Tag.name == 'test_tag').first()
    if existing:
        return existing
    
    tag = Tag(name='test_tag')
    db_session.add(tag)
    db_session.commit()
    db_session.refresh(tag)
    return tag

@pytest.fixture
def sample_article(db_session, moderator_user, sample_tag):
    from app.models import Article, ArticleTag
    article = Article(
        title='Sample Article',
        content='Content',
        author_id=moderator_user.user_id,
        is_published=True
    )
    db_session.add(article)
    db_session.commit()
    
    # Привязываем тег
    article_tag = ArticleTag(article_id=article.article_id, tag_id=sample_tag.tag_id)
    db_session.add(article_tag)
    db_session.commit()
    db_session.refresh(article)
    return article

@pytest.fixture
def published_article(db_session, moderator_user, sample_tag):
    from app.models import Article, ArticleTag
    
    # Проверяем существование
    existing = db_session.query(Article).filter(
        Article.title == 'Published Article'
    ).first()
    if existing:
        return existing
    
    article = Article(
        title='Published Article',
        content='Public content',
        author_id=moderator_user.user_id,
        is_published=True
    )
    db_session.add(article)
    db_session.commit()
    
    article_tag = ArticleTag(article_id=article.article_id, tag_id=sample_tag.tag_id)
    db_session.add(article_tag)
    db_session.commit()
    db_session.refresh(article)
    return article

@pytest.fixture
def draft_article(db_session, moderator_user):
    from app.models import Article
    
    # Проверяем существование
    existing = db_session.query(Article).filter(
        Article.title == 'Draft Article'
    ).first()
    if existing:
        return existing
    
    article = Article(
        title='Draft Article',
        content='Hidden content',
        author_id=moderator_user.user_id,
        is_published=False
    )
    db_session.add(article)
    db_session.commit()
    db_session.refresh(article)
    return article
