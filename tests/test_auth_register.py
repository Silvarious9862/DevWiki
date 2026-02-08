from fastapi.testclient import TestClient
from app.main import app  # где у тебя app.include_router(auth.router)

client = TestClient(app)


def test_register_user_success(client):
    payload = {
        "login": "testuserpytest_register",
        "email": "test_register@example.com",
        "password": "strong_password",
        "first_name": "Test",
        "last_name": "User",
    }

    response = client.post("/auth/register", json=payload)

    print(response.status_code, response.json())

    assert response.status_code == 201
    data = response.json()
    assert data["login"] == payload["login"]
    assert data["email"] == payload["email"]
