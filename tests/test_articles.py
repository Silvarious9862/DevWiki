import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from main import app

client = TestClient(app)

@pytest.fixture
def article():
    # Создание статьи
    response = client.post(
        "/articles/",
        json={"title": "Фикстурная статья", "content": "Контент"}
    )
    assert response.status_code == 201
    data = response.json()
    slug = data["slug"]

    # Контейнер для хранения актуального slug
    state = {"slug": slug}
    yield state

    # Очистка после теста
    client.delete(f"/articles/{state['slug']}")

def test_create_article(article):
    assert article["slug"].startswith("fikstur")

def test_get_article(article):
    response = client.get(f"/articles/{article['slug']}")
    assert response.status_code == 200

def test_update_article(article):
    response = client.put(
        f"/articles/{article['slug']}",
        json={"title": "Статья обновлена", "content": "Новый текст"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Статья обновлена"
    assert data["content"] == "Новый текст"

    # Обновляем slug в фикстуре
    article["slug"] = data["slug"]

def test_delete_article(article):
    response = client.delete(f"/articles/{article['slug']}")
    assert response.status_code == 200
    assert client.get(f"/articles/{article['slug']}").status_code == 404
