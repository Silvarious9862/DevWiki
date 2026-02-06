from fastapi.testclient import TestClient
from app.main import app  # где у тебя app.include_router(auth.router)

client = TestClient(app)


def test_register_user_success(client):
    payload = {
        "login": "testuserpytest",
        "email": "test@example.com",
        "password": "strong_password",
        "first_name": "Test",
        "last_name": "User",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["login"] == payload["login"]
    assert data["email"] == payload["email"]
