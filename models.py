# models.py
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    articles = relationship("Article", back_populates="author")
    revisions = relationship("Revision", back_populates="editor")
    images = relationship("Image", back_populates="uploader")


class Article(Base):
    __tablename__ = "article"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    revision = Column(Integer, default=1)
    is_published = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)

    author = relationship("User", back_populates="articles")
    revisions = relationship("Revision", back_populates="article", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="article", cascade="all, delete-orphan")


class Revision(Base):
    __tablename__ = "revisions"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("article.id", ondelete="CASCADE"))
    revision_number = Column(Integer, nullable=False)
    editor_id = Column(Integer, ForeignKey("users.id"))
    content_snapshot = Column(Text, nullable=False)
    edited_at = Column(TIMESTAMP, default=datetime.utcnow)
    comment = Column(String(255))

    article = relationship("Article", back_populates="revisions")
    editor = relationship("User", back_populates="revisions")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("article.id", ondelete="CASCADE"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    mime_type = Column(String(50))
    uploaded_at = Column(TIMESTAMP, default=datetime.utcnow)
    uploader_id = Column(Integer, ForeignKey("users.id"))

    article = relationship("Article", back_populates="images")
    uploader = relationship("User", back_populates="images")
