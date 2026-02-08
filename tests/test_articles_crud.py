import pytest


def login_moderator(client):
    resp = client.post(
        "/auth/login",
        json={"login": "test_moderator", "password": "test_pass_123"},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_list_articles_anonymous(client, published_article, draft_article):
    """Аноним видит только опубликованные статьи"""
    resp = client.get("/articles")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Все статьи опубликованы
    for item in data:
        assert item["is_published"] is True
    
    # Опубликованная статья есть
    assert any(a["article_id"] == published_article.article_id for a in data)
    # Черновик скрыт
    assert not any(a["article_id"] == draft_article.article_id for a in data)


def test_list_articles_moderator(client, moderator_user, published_article, draft_article):
    """Модератор видит все статьи"""
    token = login_moderator(client)
    resp = client.get("/articles", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    
    # Обе статьи видны
    assert any(a["article_id"] == published_article.article_id for a in data)
    assert any(a["article_id"] == draft_article.article_id for a in data)


def test_create_article_unauthorized(client):
    resp = client.post(
        "/articles",
        json={
            "title": "Не должен создаться",
            "content": "Нет токена.",
            "is_published": True,
        },
    )
    assert resp.status_code in (401, 403)


def test_update_article_unauthorized(client, published_article):
    resp = client.put(
        f"/articles/{published_article.article_id}",
        json={"title": "Пробуем без авторизации"},
    )
    assert resp.status_code in (401, 403)


def test_delete_article_unauthorized(client, published_article):
    resp = client.delete(f"/articles/{published_article.article_id}")
    assert resp.status_code in (401, 403)


def test_create_article_moderator(client, moderator_user):
    token = login_moderator(client)
    resp = client.post(
        "/articles",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Тестовая статья CRUD",
            "content": "Содержимое тестовой статьи.",
            "is_published": True,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Тестовая статья CRUD"
    assert data["is_published"] is True


def test_get_published_article_anonymous(client, published_article):
    """Аноним может читать опубликованные статьи"""
    resp = client.get(f"/articles/{published_article.article_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["article_id"] == published_article.article_id
    assert data["title"] == "Published Article"


def test_get_draft_article_anonymous(client, draft_article):
    """Аноним не может читать черновики"""
    resp = client.get(f"/articles/{draft_article.article_id}")
    assert resp.status_code in (403, 404)


def test_get_draft_article_moderator(client, moderator_user, draft_article):
    """Модератор может читать черновики"""
    token = login_moderator(client)
    resp = client.get(
        f"/articles/{draft_article.article_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["article_id"] == draft_article.article_id
    assert data["is_published"] is False


def test_get_nonexistent_article(client):
    resp = client.get("/articles/999999")
    assert resp.status_code == 404


def test_update_nonexistent_article_moderator(client, moderator_user):
    token = login_moderator(client)
    resp = client.put(
        "/articles/999999",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Не должно обновиться"},
    )
    assert resp.status_code == 404


def test_delete_nonexistent_article_moderator(client, moderator_user):
    token = login_moderator(client)
    resp = client.delete(
        "/articles/999999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


def test_update_article_moderator(client, moderator_user, published_article):
    token = login_moderator(client)
    
    resp = client.put(
        f"/articles/{published_article.article_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Обновлённый заголовок CRUD"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Обновлённый заголовок CRUD"
    assert data["article_id"] == published_article.article_id


def test_delete_article_moderator(client, moderator_user):
    token = login_moderator(client)
    
    # Создаем статью для удаления
    resp = client.post(
        "/articles",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "To Delete", "content": "Content", "is_published": True},
    )
    article_id = resp.json()["article_id"]
    
    # Удаляем
    resp = client.delete(
        f"/articles/{article_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204

    # Проверяем, что удалена
    resp = client.get(f"/articles/{article_id}")
    assert resp.status_code == 404


def test_filter_by_tag_anonymous(client, published_article, draft_article, sample_tag):
    """Аноним видит только опубликованные статьи с тегом"""
    resp = client.get(f"/articles?tag_ids={sample_tag.tag_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Опубликованная статья с тегом видна
    assert any(a["article_id"] == published_article.article_id for a in data)
    # Все статьи опубликованы
    for item in data:
        assert item["is_published"] is True


def test_filter_by_tag_moderator(client, moderator_user, published_article, sample_tag):
    """Модератор видит все статьи с тегом"""
    token = login_moderator(client)
    resp = client.get(
        f"/articles?tag_ids={sample_tag.tag_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(a["article_id"] == published_article.article_id for a in data)
