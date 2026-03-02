from fastapi.testclient import TestClient
from app.main import app  # где у тебя app.include_router(auth.router)

client = TestClient(app)


# tests/test_auth_login.py

def test_login_success(client):
    # сначала регистрируем
    register_payload = {
        "login": "loginuser",
        "email": "loginuser@example.com",
        "password": "strong_password",
        "first_name": "Test",
        "last_name": "User",
    }
    r = client.post("/auth/register", json=register_payload)
    assert r.status_code == 201

    # потом логинимся
    login_payload = {
        "login": "loginuser",
        "password": "strong_password",
    }
    resp = client.post("/auth/login", json=login_payload)

    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    print(data["access_token"])
    assert data["token_type"] == "bearer"
    assert data["user"]["login"] == "loginuser"

