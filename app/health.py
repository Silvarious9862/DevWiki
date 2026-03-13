from sqlalchemy import text
from fastapi import APIRouter

from app.db import engine

import httpx

FRONTEND_HOST = "http://192.168.100.30:3000"

router = APIRouter(tags=["health"])

@router.get("/health")
async def health():
    """Проверка состояния системы"""
    app_status = await check_app()
    db_status = check_db()
    front_status = await check_front()
    #front_status = {"status": "skipped"}

    return {
        "system": "wiki",
        "app": app_status,
        "db": db_status,
        "front": front_status,
    }

async def check_app():
    return {"status": "ok", "app": "alive"}

def check_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "alive"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

async def check_front():
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(FRONTEND_HOST)
            if r.status_code == 200:
                return {"status": "ok", "front": "alive"}
            else:
                return {"status": "error", "details": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

