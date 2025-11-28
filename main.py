from fastapi import FastAPI
from health import check_app, check_db, check_front
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # если фронт работает локально
        "http://192.168.100.30:3000"   # если фронт на отдельной VM
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    app_status = await check_app()
    db_status = check_db()
    front_status = await check_front()

    return {
        "system": "wiki",
        "app": app_status,
        "db": db_status,
        "front": front_status
    }