from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# ============== Пагинация ==============
class PaginationParams(BaseModel):
    """Параметры пагинации"""
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel):
    """Базовый ответ с пагинацией"""
    total: int
    page: int
    page_size: int
    items: List


# ============== Пользователи ==============
class UserRegister(BaseModel):
    """Схема для регистрации пользователя"""
    login: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(BaseModel):
    """Схема для авторизации"""
    login: str
    password: str


class UserResponse(BaseModel):
    """Схема ответа с данными пользователя"""
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    login: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    is_active: bool
    role_id: Optional[int]
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

class RefreshRequest(BaseModel):
    refresh_token: str


# ============== Категории ==============
class CategoryCreate(BaseModel):
    """Схема создания категории"""
    name: str
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    """Схема ответа с данными категории"""
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    name: str
    description: Optional[str]
    created_at: datetime


# ============== Теги ==============
class TagCreate(BaseModel):
    name: str

class TagUpdate(BaseModel):
    name: str

class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    tag_id: int
    name: str
    created_at: datetime

class TagWithCountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    tag_id: int
    name: str
    created_at: datetime
    articles_count: int

# ============== Статьи ==============
class ArticleCreate(BaseModel):
    """Схема создания статьи"""
    title: str
    content: str
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []
    is_published: bool = True


class ArticleUpdate(BaseModel):
    """Схема обновления статьи"""
    title: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    is_published: Optional[bool] = None


class ArticleResponse(BaseModel):
    """Схема ответа с данными статьи"""
    model_config = ConfigDict(from_attributes=True)

    article_id: int
    author_login: str | None = None
    author_first_name: str | None = None
    author_last_name: str | None = None
    title: str
    content: str
    author_id: int
    category_id: Optional[int]
    category_name: Optional[str] = None
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    likes_count: int
    dislikes_count: int
    view_count: int
    user_reaction: str | None = None
    tag_ids: List[int] = []


class ArticleListItem(BaseModel):
    """Схема элемента списка статей (без полного содержимого)"""
    model_config = ConfigDict(from_attributes=True)

    article_id: int
    title: str
    author_id: int
    author_login: str | None = None
    author_first_name: str | None = None
    author_last_name: str | None = None
    category_id: Optional[int]
    category_name: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    likes_count: int
    dislikes_count: int
    view_count: int
    user_reaction: str | None = None
    tag_ids: List[int] = []


class ArticleSearchParams(BaseModel):
    """Параметры поиска статей"""
    query: Optional[str] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    is_published: Optional[bool] = None


# ============== Комментарии ==============
class CommentCreate(BaseModel):
    """Схема создания комментария"""
    text: str


class CommentUpdate(BaseModel):
    """Схема обновления комментария"""
    text: str


class CommentResponse(BaseModel):
    """Схема ответа с данными комментария"""
    model_config = ConfigDict(from_attributes=True)

    comment_id: int
    text: str
    article_id: int
    author_id: int
    likes_count: int
    dislikes_count: int
    created_at: datetime
    updated_at: datetime


# ============== Вложения ==============
class AttachmentResponse(BaseModel):
    """Схема ответа с данными вложения"""
    model_config = ConfigDict(from_attributes=True)

    attachment_id: int
    filename: str
    file_url: str
    mime_type: Optional[str]
    file_size: Optional[int]
    article_id: int
    uploader_id: Optional[int]
    uploaded_at: datetime


# ============== Рейтинги ==============
class RatingCreate(BaseModel):
    type: str  # 'like' или 'dislike'

class RatingToggleResponse(BaseModel):
    """Ответ при установке/смене реакции"""
    likes_count: int
    dislikes_count: int
    user_reaction: str | None = None  # 'like' | 'dislike' | None



class RatingResponse(BaseModel):
    """Схема ответа с данными рейтинга"""
    model_config = ConfigDict(from_attributes=True)

    reaction_id: int
    reactionable_type: str
    reactionable_id: int
    user_id: int
    type: str
    created_at: datetime


# ============== Публикация/скрытие статьи ==============
class ArticlePublishUpdate(BaseModel):
    """Схема для публикации/скрытия статьи"""
    is_published: bool
