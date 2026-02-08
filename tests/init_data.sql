-- init_data.sql: начальные данные для тестовой БД

-- Роли
INSERT INTO roles (name, description) VALUES 
    ('user', 'Обычный пользователь системы'),
    ('moderator', 'Модератор с расширенными правами')
ON CONFLICT (name) DO NOTHING;

-- Пользователи (пароли — заглушки, в тестах важен только факт существования)
INSERT INTO users (login, email, password_hash, first_name, last_name, role_id)
VALUES 
    ('silvarious', 'admin@devwiki.local', '$2b$12$QsP2DcWbsgaMApbTprS6xOEhKIu6PhN7jACv86QTAndPo/SF9MuxK', 'Admin', 'User', 
        (SELECT role_id FROM roles WHERE name = 'moderator')),
    ('testuser', 'user@devwiki.local', '$2b$12$placeholder_hash_user123', 'Test', 'User', 
        (SELECT role_id FROM roles WHERE name = 'user'))
ON CONFLICT (login) DO NOTHING;

-- Категории
INSERT INTO categories (name, description) VALUES
    ('Backend', 'Серверная разработка и архитектура'),
    ('Frontend', 'Клиентская разработка и UI/UX'),
    ('DevOps', 'Автоматизация, CI/CD, инфраструктура'),
    ('Security', 'Безопасность и защита данных'),
    ('Database', 'Работа с базами данных'),
    ('Testing', 'Тестирование и обеспечение качества'),
    ('General', 'Общие вопросы разработки')
ON CONFLICT (name) DO NOTHING;

-- Теги
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
    ('best-practices')
ON CONFLICT (name) DO NOTHING;

-- Статьи (используем admin как автора)
INSERT INTO articles (
    title,
    content,
    author_id,
    category_id,
    is_published,
    published_at,
    created_at,
    updated_at,
    likes_count,
    dislikes_count,
    view_count
) VALUES
(
    'Введение в Dev Wiki',
    'Первая тестовая статья про Dev Wiki и её цели.',
    (SELECT user_id FROM users WHERE login = 'admin'),
    (SELECT category_id FROM categories WHERE name = 'General'),
    TRUE,
    NOW(),
    NOW(),
    NOW(),
    0,
    0,
    0
),
(
    'Черновик: архитектура системы',
    'Черновик статьи с описанием архитектуры Dev Wiki.',
    (SELECT user_id FROM users WHERE login = 'admin'),
    (SELECT category_id FROM categories WHERE name = 'Backend'),
    FALSE,
    NULL,
    NOW(),
    NOW(),
    2,
    0,
    5
),
(
    'Пособие по Markdown',
    'Статья о том, как использовать Markdown в Dev Wiki.',
    (SELECT user_id FROM users WHERE login = 'admin'),
    (SELECT category_id FROM categories WHERE name = 'General'),
    TRUE,
    NOW(),
    NOW(),
    NOW(),
    10,
    1,
    42
);

-- Привязка тегов к статьям
-- 1: Введение в Dev Wiki -> docker, git, tutorial
INSERT INTO article_tags (article_id, tag_id)
SELECT a.article_id, t.tag_id
FROM articles a, tags t
WHERE a.title = 'Введение в Dev Wiki'
  AND t.name IN ('docker', 'git', 'tutorial')
ON CONFLICT DO NOTHING;

-- 2: Черновик архитектуры -> fastapi, postgresql, docker, api
INSERT INTO article_tags (article_id, tag_id)
SELECT a.article_id, t.tag_id
FROM articles a, tags t
WHERE a.title = 'Черновик: архитектура системы'
  AND t.name IN ('fastapi', 'postgresql', 'docker', 'api')
ON CONFLICT DO NOTHING;

-- 3: Пособие по Markdown -> python, tutorial, best-practices
INSERT INTO article_tags (article_id, tag_id)
SELECT a.article_id, t.tag_id
FROM articles a, tags t
WHERE a.title = 'Пособие по Markdown'
  AND t.name IN ('python', 'tutorial', 'best-practices')
ON CONFLICT DO NOTHING;
