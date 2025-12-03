import requests

BASE_URL = "http://localhost:8000"

def test_article_live():
    response = requests.post(
        f"{BASE_URL}/articles/",
        json={"title": "Интеграционный тест", "content": "Контент"}
    )
    assert response.status_code == 201
    data = response.json()
    slug = data["slug"]

    # проверяем получение
    r = requests.get(f"{BASE_URL}/articles/{slug}")
    assert r.status_code == 200
    assert r.json()["title"] == "Интеграционный тест"

    # удаляем
    d = requests.delete(f"{BASE_URL}/articles/{slug}")
    assert d.status_code == 200
