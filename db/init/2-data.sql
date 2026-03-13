-- 2-data.sql
-- Начальные данные для DevWiki (только роли user/moderator)

-- Роли
INSERT INTO public.roles (role_id, name, description) VALUES
    (1, 'user', 'Обычный пользователь'),
    (2, 'moderator', 'Модератор контента');

SELECT pg_catalog.setval('public.roles_role_id_seq', 2, true);

-- Пользователи (1 обычный, 3 модератора)
-- Пароль у всех: 123 (bcrypt-хеш из условия)
INSERT INTO public.users (user_id, login, email, password_hash, first_name, last_name, role_id)
VALUES
    (1, 'alex',   'alex@example.com',   '$2b$12$QsP2DcWbsgaMApbTprS6xOEhKIu6PhN7jACv86QTAndPo/SF9MuxK', 'Алексей',  'Иванов',    1),
    (2, 'maria',  'maria@example.com',  '$2b$12$QsP2DcWbsgaMApbTprS6xOEhKIu6PhN7jACv86QTAndPo/SF9MuxK', 'Мария',   'Петрова',   2),
    (3, 'dmitry', 'dmitry@example.com', '$2b$12$QsP2DcWbsgaMApbTprS6xOEhKIu6PhN7jACv86QTAndPo/SF9MuxK', 'Дмитрий', 'Сидоров',   2),
    (4, 'olga',   'olga@example.com',   '$2b$12$QsP2DcWbsgaMApbTprS6xOEhKIu6PhN7jACv86QTAndPo/SF9MuxK', 'Ольга',   'Кузнецова', 2);

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);

-- Категории
INSERT INTO public.categories (category_id, name, description)
VALUES
    (1, 'Архитектура', 'Шаблоны и принципы проектирования систем'),
    (2, 'Backend',     'Серверная разработка, API и базы данных'),
    (3, 'Frontend',    'Интерфейсы, UX и браузерные технологии');

SELECT pg_catalog.setval('public.categories_category_id_seq', 3, true);

-- Теги (10 штук)
INSERT INTO public.tags (tag_id, name)
VALUES
    (1, 'fastapi'),
    (2, 'postgresql'),
    (3, 'docker'),
    (4, 'react'),
    (5, 'auth'),
    (6, 'architecture'),
    (7, 'testing'),
    (8, 'ci-cd'),
    (9, 'performance'),
    (10,'documentation');

SELECT pg_catalog.setval('public.tags_tag_id_seq', 10, true);

-- Статьи (3 штуки, разные авторы, округлые просмотры <= 100)

INSERT INTO public.articles
(article_id, title, content, author_id, category_id, is_published, published_at, likes_count, dislikes_count, view_count)
VALUES
(1,
 'Архитектура DevWiki: обзор основных компонентов',
 'DevWiki строится вокруг простой, но расширяемой архитектуры, разделяющей ответственность между frontend, backend и базой данных. Frontend предоставляет удобный интерфейс для работы с документацией, тогда как backend отвечает за авторизацию, валидацию и бизнес-логику.\n\nБаза данных PostgreSQL хранит структуру статей, теги, комментарии и историю изменений. Такой подход позволяет масштабировать систему, не меняя базовых концепций: статьи остаются независимыми сущностями, а связи через теги обеспечивают гибкую навигацию.\n\nОтдельное внимание уделено ролям пользователей и системе прав. Это позволяет модераторам управлять контентом, не вмешиваясь в инфраструктуру, а простым пользователям — безопасно публиковать материалы в рамках установленной модели доступа.',
 2, 1, true, CURRENT_TIMESTAMP, 3, 0, 80),

(2,
 'Практика работы с FastAPI и PostgreSQL в DevWiki',
 'Backend DevWiki реализован на FastAPI, что обеспечивает сочетание высокой производительности и читаемого кода. Асинхронная модель позволяет обрабатывать множество запросов одновременно, а типизация упрощает сопровождение проекта в долгосрочной перспективе.\n\nХранение данных в PostgreSQL даёт надёжные транзакции, мощный SQL и богатый набор индексов. В DevWiki используются связи между таблицами для статей, тегов, комментариев и реакций, что позволяет строить сложные выборки без дублирования данных.\n\nОсобое внимание уделяется миграциям и управлению схемой. Чётко определённая структура таблиц в сочетании с init-скриптами и контейнерами Docker позволяет легко разворачивать новые стенды и воспроизводить окружение разработчика.',
 3, 2, true, CURRENT_TIMESTAMP, 2, 1, 60),

(3,
 'Организация frontend в DevWiki на основе React',
 'Интерфейс DevWiki реализован на React, что позволяет эффективно управлять состоянием и разбивать систему на переиспользуемые компоненты. Каждая страница представления статьи, списка или формы редактирования представляет собой независимый модуль.\n\nОсобое внимание уделено UX: быстрый поиск, подсветка Markdown и удобная навигация по тегам и категориям. Благодаря этому пользователи могут сосредоточиться на содержании, а не на борьбе с интерфейсом.\n\nИнтеграция с backend через хорошо спроектированный API делает поведение системы предсказуемым. React-компоненты используют единый слой работы с данными, а обработка ошибок и уведомления помогает пользователям быстрее ориентироваться в изменениях.',
 4, 3, true, CURRENT_TIMESTAMP, 1, 0, 40);

SELECT pg_catalog.setval('public.articles_article_id_seq', 3, true);

-- Связь статей с тегами (article_tags)
INSERT INTO public.article_tags (article_tag_id, article_id, tag_id)
VALUES
    -- Статья 1: архитектура, docker, documentation, performance
    (1, 1, 3),
    (2, 1, 6),
    (3, 1, 9),
    (4, 1, 10),

    -- Статья 2: fastapi, postgresql, testing, ci-cd
    (5, 2, 1),
    (6, 2, 2),
    (7, 2, 7),
    (8, 2, 8),

    -- Статья 3: react, frontend, documentation
    (9,  3, 4),
    (10, 3, 10),
    (11, 3, 6);

SELECT pg_catalog.setval('public.article_tags_article_tag_id_seq', 11, true);

-- Комментарии (по 2 на статью минимум)
INSERT INTO public.comments
(comment_id, text, article_id, author_id, likes_count, dislikes_count, depth)
VALUES
    -- К статье 1
    (1, 'Хорошее высокоуровневое описание. Было бы полезно добавить диаграммы последовательностей для ключевых сценариев.', 1, 3, 1, 0, 0),
    (2, 'Нравится разделение ролей и модерации. Такое решение упростит поддержку проекта в учебной группе.', 1, 1, 2, 0, 0),

    -- К статье 2
    (3, 'Отличное объяснение интеграции FastAPI и PostgreSQL. Особенно полезно упоминание миграций и init-скриптов.', 2, 2, 1, 0, 0),
    (4, 'Можно ещё добавить примеры сложных запросов с JOIN по тегам и реакциям.', 2, 4, 1, 0, 0),

    -- К статье 3
    (5, 'Хорошо, что акцент сделан на UX. Поиск и навигация по тегам критичны для wiki.', 3, 2, 1, 0, 0),
    (6, 'Интересно было бы увидеть пример структуры React-компонентов и маршрутизации.', 3, 3, 1, 0, 0);

SELECT pg_catalog.setval('public.comments_comment_id_seq', 6, true);

-- Реакции (ratings) на статьи и комментарии
INSERT INTO public.ratings
(reaction_id, reactionable_type, reactionable_id, user_id, type)
VALUES
    -- Реакции на статьи
    (1, 'article', 1, 1, 'like'),
    (2, 'article', 1, 2, 'like'),
    (3, 'article', 1, 3, 'like'),

    (4, 'article', 2, 1, 'like'),
    (5, 'article', 2, 2, 'like'),
    (6, 'article', 2, 4, 'dislike'),

    (7, 'article', 3, 2, 'like'),
    (8, 'article', 3, 3, 'like'),

    -- Реакции на комментарии
    (9,  'comment', 1, 2, 'like'),
    (10, 'comment', 2, 3, 'like'),
    (11, 'comment', 3, 4, 'like'),
    (12, 'comment', 4, 1, 'like'),
    (13, 'comment', 5, 3, 'like'),
    (14, 'comment', 6, 2, 'dislike');

SELECT pg_catalog.setval('public.ratings_reaction_id_seq', 14, true);
