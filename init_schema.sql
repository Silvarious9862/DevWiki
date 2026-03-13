-- ============================================
-- Dev Wiki Database Schema
-- Инициализация схемы БД для PostgreSQL
-- ============================================

-- Удаление существующих таблиц (если есть)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- Создание таблиц
-- ============================================

-- Таблица ролей
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Таблица пользователей
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    login VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    role_id INTEGER REFERENCES roles(role_id)
);

-- Таблица категорий
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тегов
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статей
CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(user_id),
    category_id INTEGER REFERENCES categories(category_id),
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0
);

-- Таблица связи статей и тегов (many-to-many)
CREATE TABLE article_tags (
    article_tag_id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    UNIQUE(article_id, tag_id)
);

-- Таблица комментариев
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(user_id),
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица вложений (файлов и изображений)
CREATE TABLE attachments (
    attachment_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    uploader_id INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Универсальная таблица для лайков/дизлайков
CREATE TABLE ratings (
    reaction_id SERIAL PRIMARY KEY,
    reactionable_type VARCHAR(50) NOT NULL,  -- 'article' или 'comment'
    reactionable_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,  -- 'like' или 'dislike'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reactionable_type, reactionable_id, user_id)
);

-- ============================================
-- Создание индексов
-- ============================================

-- Индексы для пользователей
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Индексы для статей
CREATE INDEX idx_articles_title ON articles(title);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- Индексы для комментариев
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Индексы для тегов
CREATE INDEX idx_tags_name ON tags(name);

-- Индексы для категорий
CREATE INDEX idx_categories_name ON categories(name);

-- Индексы для связи статей и тегов
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);

-- Индексы для вложений
CREATE INDEX idx_attachments_article_id ON attachments(article_id);
CREATE INDEX idx_attachments_uploader_id ON attachments(uploader_id);

-- Индексы для рейтингов
CREATE INDEX idx_ratings_reactionable ON ratings(reactionable_type, reactionable_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- ============================================
-- Начальные данные
-- ============================================

-- Базовые роли
INSERT INTO roles (name, description) VALUES 
    ('user', 'Обычный пользователь системы'),
    ('moderator', 'Модератор с расширенными правами');

-- Тестовый администратор (пароль: admin123)
-- В продакшене пароль должен быть захэширован через bcrypt
INSERT INTO users (login, email, password_hash, first_name, last_name, role_id) VALUES 
    ('admin', 'admin@devwiki.local', '$2b$12$placeholder_hash_admin123', 'Admin', 'User', 2),
    ('testuser', 'user@devwiki.local', '$2b$12$placeholder_hash_user123', 'Test', 'User', 1);

-- Базовые категории
INSERT INTO categories (name, description) VALUES
    ('Backend', 'Серверная разработка и архитектура'),
    ('Frontend', 'Клиентская разработка и UI/UX'),
    ('DevOps', 'Автоматизация, CI/CD, инфраструктура'),
    ('Security', 'Безопасность и защита данных'),
    ('Database', 'Работа с базами данных'),
    ('Testing', 'Тестирование и обеспечение качества'),
    ('General', 'Общие вопросы разработки');

-- Базовые теги
INSERT INTO tags (name) VALUES
    ('python'),
    ('javascript'),
    ('react'),
    ('fastapi'),
    ('postgresql'),
    ('docker'),
    ('git'),
    ('api'),
    ('tutorial'),
    ('best-practices');

-- ============================================
-- Комментарии
-- ============================================

COMMENT ON TABLE roles IS 'Роли пользователей в системе';
COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON TABLE categories IS 'Категории статей';
COMMENT ON TABLE tags IS 'Теги для классификации статей';
COMMENT ON TABLE articles IS 'Статьи Wiki';
COMMENT ON TABLE article_tags IS 'Связь статей с тегами (many-to-many)';
COMMENT ON TABLE comments IS 'Комментарии к статьям';
COMMENT ON TABLE attachments IS 'Вложенные файлы и изображения к статьям';
COMMENT ON TABLE ratings IS 'Лайки и дизлайки для статей и комментариев';

COMMENT ON COLUMN articles.is_published IS 'Опубликована ли статья (видна всем)';
COMMENT ON COLUMN articles.view_count IS 'Количество просмотров статьи';
COMMENT ON COLUMN ratings.reactionable_type IS 'Тип объекта: article или comment';
COMMENT ON COLUMN ratings.reactionable_id IS 'ID объекта (статьи или комментария)';
COMMENT ON COLUMN ratings.type IS 'Тип реакции: like или dislike';

-- ============================================
-- Завершение
-- ============================================

-- Вывод информации о созданных таблицах
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

ANALYZE;

-- Готово!

