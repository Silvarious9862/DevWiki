# tests/test_articles_crud.py

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def login_moderator():
    resp = client.post(
        "/auth/login",
        json={"login": "silvarious", "password": "123"},  # подставь
    )
    assert resp.status_code == 200
    data = resp.json()
    return data["access_token"]


def test_list_articles_anonymous():
    resp = client.get("/articles")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    for item in data:
        assert item["is_published"] is True


def test_create_article_unauthorized():
    resp = client.post(
        "/articles",
        json={
            "title": "Не должен создаться",
            "content": "Нет токена.",
            "category_id": 7,
            "tag_ids": [],
            "is_published": True,
        },
    )
    assert resp.status_code in (401, 403)


def test_update_article_unauthorized():
    resp = client.put(
        "/articles/1",
        json={"title": "Пробуем без авторизации"},
    )
    assert resp.status_code in (401, 403)


def test_delete_article_unauthorized():
    resp = client.delete("/articles/1")
    assert resp.status_code in (401, 403)


def test_create_article_moderator():
    token = login_moderator()
    resp = client.post(
        "/articles",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Тестовая статья CRUD",
            "content": "Содержимое тестовой статьи.",
            "category_id": 7,
            "tag_ids": [],
            "is_published": True,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Тестовая статья CRUD"
    global created_article_id
    created_article_id = data["article_id"]


def test_get_existing_article_anonymous():
    resp = client.get(f"/articles/{created_article_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["article_id"] == created_article_id


def test_get_nonexistent_article():
    resp = client.get("/articles/999999")
    assert resp.status_code == 404


def test_update_nonexistent_article_moderator():
    token = login_moderator()
    resp = client.put(
        "/articles/999999",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Не должно обновиться"},
    )
    assert resp.status_code == 404


def test_delete_nonexistent_article_moderator():
    token = login_moderator()
    resp = client.delete(
        "/articles/999999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


def test_update_article_moderator():
    token = login_moderator()
    resp = client.put(
        f"/articles/{created_article_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Обновлённый заголовок CRUD"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Обновлённый заголовок CRUD"


def test_delete_article_moderator():
    token = login_moderator()
    resp = client.delete(
        f"/articles/{created_article_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204

    resp = client.get(f"/articles/{created_article_id}")
    assert resp.status_code == 404

def test_filter_by_tag_anonymous():
    # предположим, что у тега 6 ("docker") есть хотя бы одна опубликованная статья
    resp = client.get("/articles?tag_ids=6")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Аноним видит только опубликованные статьи с этим тегом
    for item in data:
        assert item["is_published"] is True
        # здесь мы не проверяем tag_ids, так как в ArticleListItem их нет,
        # доверяем фильтру на уровне роутера


def test_filter_by_tag_moderator():
    token = login_moderator()
    resp = client.get(
        "/articles?tag_ids=6",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Модератор видит и опубликованные, и черновики с этим тегом (если они есть)
    assert len(data) >= 1