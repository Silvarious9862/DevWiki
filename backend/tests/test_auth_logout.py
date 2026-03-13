# tests/test_auth_logout.py
from fastapi.testclient import TestClient
from app.main import app
from app.auth import require_auth


class FakeUser:
    def __init__(self, user_id: int = 1, email: str = "test@example.com", is_active: bool = True):
        self.user_id = user_id
        self.email = email
        self.is_active = is_active


client = TestClient(app)


def override_require_auth():
    return FakeUser()


def test_logout_unauthorized():
    response = client.post("/auth/logout")
    assert response.status_code == 401


def test_logout_authorized():
    app.dependency_overrides[require_auth] = override_require_auth

    response = client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"message": "Logged out"}

    app.dependency_overrides.pop(require_auth, None)
