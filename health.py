from sqlalchemy import text
from db import engine
import httpx

FRONTEND_HOST = "http://192.168.100.30:3000"

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

