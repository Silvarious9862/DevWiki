# models.py
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class Role(Base):
    """Роли пользователей (анонимный, авторизованный, модератор)"""
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))

    users = relationship("User", back_populates="role")


class User(Base):
    """Пользователи системы"""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    login = Column(String(150), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    articles = relationship("Article", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="uploader")


class Category(Base):
    """Категории статей"""
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    articles = relationship("Article", back_populates="category")


class Tag(Base):
    """Теги для статей"""
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    article_tags = relationship("ArticleTag", back_populates="tag", cascade="all, delete-orphan")


class Article(Base):
    """Статьи Wiki"""
    __tablename__ = "articles"

    article_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    is_published = Column(Boolean, default=True)
    published_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    likes_count = Column(Integer, default=0)
    dislikes_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    author = relationship("User", back_populates="articles")
    category = relationship("Category", back_populates="articles")
    comments = relationship("Comment", back_populates="article", cascade="all, delete-orphan")
    article_tags = relationship("ArticleTag", back_populates="article", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="article", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="article", cascade="all, delete-orphan",
                          foreign_keys="[Rating.reactionable_id]",
                          primaryjoin="and_(Article.article_id==Rating.reactionable_id, Rating.reactionable_type=='article')")


class ArticleTag(Base):
    """Связь статей с тегами (many-to-many)"""
    __tablename__ = "article_tags"

    article_tag_id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.article_id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.tag_id", ondelete="CASCADE"), nullable=False)

    article = relationship("Article", back_populates="article_tags")
    tag = relationship("Tag", back_populates="article_tags")


class Comment(Base):
    """Комментарии к статьям"""
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    article_id = Column(Integer, ForeignKey("articles.article_id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    likes_count = Column(Integer, default=0)
    dislikes_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    article = relationship("Article", back_populates="comments")
    author = relationship("User", back_populates="comments")
    ratings = relationship("Rating", back_populates="comment", cascade="all, delete-orphan",
                          foreign_keys="[Rating.reactionable_id]",
                          primaryjoin="and_(Comment.comment_id==Rating.reactionable_id, Rating.reactionable_type=='comment')")


class Attachment(Base):
    """Вложения (изображения и файлы) к статьям"""
    __tablename__ = "attachments"

    attachment_id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    mime_type = Column(String(100))
    file_size = Column(Integer)
    article_id = Column(Integer, ForeignKey("articles.article_id", ondelete="CASCADE"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.user_id"))
    uploaded_at = Column(TIMESTAMP, default=datetime.utcnow)

    article = relationship("Article", back_populates="attachments")
    uploader = relationship("User", back_populates="attachments")


class Rating(Base):
    """Универсальная таблица для лайков/дизлайков статей и комментариев"""
    __tablename__ = "ratings"

    reaction_id = Column(Integer, primary_key=True, index=True)
    reactionable_type = Column(String(50), nullable=False)  # 'article' или 'comment'
    reactionable_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False)  # 'like' или 'dislike'
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="ratings")
    article = relationship("Article", back_populates="ratings",
                          foreign_keys=[reactionable_id],
                          primaryjoin="and_(Rating.reactionable_id==Article.article_id, Rating.reactionable_type=='article')",
                          overlaps="ratings")
    comment = relationship("Comment", back_populates="ratings",
                          foreign_keys=[reactionable_id],
                          primaryjoin="and_(Rating.reactionable_id==Comment.comment_id, Rating.reactionable_type=='comment')",
                          overlaps="ratings,article")
